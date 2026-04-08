from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from schemas import RuralHumanInput, UrbanBureauInput, PredictionResponse
from ml_service import ml_engine
from database import engine, get_db, Base
from models import LoanRecord, User
from sqlalchemy.orm import Session
import auth
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

app.include_router(auth.router, prefix="/auth")

@app.get("/")
def ping():
    return {"status": "ok", "message": "Decision Support API Online"}

def log_to_database(db: Session, module_name: str, raw_input: str, result: dict, owner_id: int, borrower_name: str):
    """Helper snippet to write a single loan evaluation record to SQLite"""
    record = LoanRecord(
        owner_id=owner_id,
        borrower_name=borrower_name,
        loan_module=module_name,
        raw_input_data=raw_input,
        risk_score=result["risk_score"],
        risk_tier=result["risk_tier"],
        decision=result["decision"],
        suggested_interest_rate=result.get("suggested_interest_rate"),
        max_loan_limit=result.get("max_loan_limit")
    )
    db.add(record)
    db.commit()

@app.post("/api/predict/rural", response_model=PredictionResponse)
def predict_rural_risk(request: RuralHumanInput, db: Session = Depends(get_db), current_user: User = Depends(auth.get_current_user)):
    """
    Submits raw application data for a Rural Microfinance applicant.
    Automatically engineers the 15 hidden features (like DTI & One-Hot columns),
    scores via XGBoost, and generates human-readable SHAP sentences.
    """
    try:
        result = ml_engine.predict_rural(request)
        # Log to SQLite!
        log_to_database(db, "Rural Microfinance", request.model_dump_json(by_alias=True), result, current_user.id, request.borrower_name)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict/urban", response_model=PredictionResponse)
def predict_urban_risk(request: UrbanBureauInput, db: Session = Depends(get_db), current_user: User = Depends(auth.get_current_user)):
    """
    Evaluates an Urban Commercial Base applicant using Bureau aggregate data.
    """
    try:
        result = ml_engine.predict_urban(request)
        # Log to SQLite!
        log_to_database(db, "Urban Commercial Bank", request.model_dump_json(by_alias=True), result, current_user.id, request.borrower_name)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history")
def get_prediction_history(db: Session = Depends(get_db), limit: int = 50, current_user: User = Depends(auth.get_current_user)):
    """
    Retrieves the last 50 loan evaluations scoped specifically to the logged in user.
    """
    records = db.query(LoanRecord).filter(LoanRecord.owner_id == current_user.id).order_by(LoanRecord.created_at.desc()).limit(limit).all()
    return records
