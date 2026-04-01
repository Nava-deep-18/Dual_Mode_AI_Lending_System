from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import RuralHumanInput, UrbanBureauInput, PredictionResponse
from ml_service import ml_engine

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

@app.post("/api/predict/rural", response_model=PredictionResponse)
def predict_rural_risk(request: RuralHumanInput):
    """
    Submits raw application data for a Rural Microfinance applicant.
    Automatically engineers the 15 hidden features (like DTI & One-Hot columns),
    scores via XGBoost, and generates human-readable SHAP sentences.
    """
    try:
        return ml_engine.predict_rural(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict/urban", response_model=PredictionResponse)
def predict_urban_risk(request: UrbanBureauInput):
    """
    Evaluates an Urban Commercial Base applicant using Bureau aggregate data.
    """
    try:
        return ml_engine.predict_urban(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
