from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from schemas import RuralHumanInput, UrbanBureauInput, PredictionResponse
from ml_service import ml_engine
from database import engine, get_db, Base
from models import LoanRecord
from sqlalchemy.orm import Session
import json

# Auto-generate the SQLite tables if they do not exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Dual-Mode AI Lending System",
    description="FastAPI Backend serving human-readable SHAP explanations.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def ping():
    return {"status": "ok", "message": "Decision Support API Online"}

def log_to_database(db: Session, module_name: str, raw_input: str, result: dict):
    """Helper snippet to write a single loan evaluation record to SQLite"""
    record = LoanRecord(
        loan_module=module_name,
        raw_input_data=raw_input,
        risk_score=result["risk_score"],
        risk_tier=result["risk_tier"],
        decision=result["decision"]
    )
    db.add(record)
    db.commit()

@app.post("/api/predict/rural", response_model=PredictionResponse)
def predict_rural_risk(request: RuralHumanInput, db: Session = Depends(get_db)):
    """
    Submits raw application data for a Rural Microfinance applicant.
    Automatically engineers the 15 hidden features (like DTI & One-Hot columns),
    scores via XGBoost, and generates human-readable SHAP sentences.
    """
    try:
        result = ml_engine.predict_rural(request)
        # Log to SQLite!
        log_to_database(db, "Rural Microfinance", request.model_dump_json(by_alias=True), result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict/urban", response_model=PredictionResponse)
def predict_urban_risk(request: UrbanBureauInput, db: Session = Depends(get_db)):
    """
    Evaluates an Urban Commercial Base applicant using Bureau aggregate data.
    """
    try:
        result = ml_engine.predict_urban(request)
        # Log to SQLite!
        log_to_database(db, "Urban Commercial Bank", request.model_dump_json(by_alias=True), result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history")
def get_prediction_history(db: Session = Depends(get_db), limit: int = 50):
    """
    Retrieves the last 50 loan evaluations for the Audit Dashboard.
    """
    records = db.query(LoanRecord).order_by(LoanRecord.created_at.desc()).limit(limit).all()
    return records
