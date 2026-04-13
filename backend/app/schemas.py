from pydantic import BaseModel, Field, field_validator
from typing import List, Optional

# --- AUTHENTICATION SCHEMAS ---
class UserCreate(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# --- SHAP Explanation Output Schema ---
class ShapExplanation(BaseModel):
    feature: str
    human_label: str
    impact: str # "HIGH RISK" or "LOW RISK"
    reason: str

class PredictionResponse(BaseModel):
    risk_score: float
    risk_tier: str
    decision: str
    suggested_interest_rate: Optional[float] = None
    max_loan_limit: Optional[float] = None
    calculated_emi: Optional[float] = None
    loan_tenure_months: Optional[int] = None
    lender_interest_rate: Optional[float] = None
    shap_explanations: List[ShapExplanation]

# --- RURAL HUMAN INPUT SCHEMA ---
# We use Pydantic to ensure all strings like "30" become integers/floats, 
# and we add strict validators to handle extreme cases.
class RuralHumanInput(BaseModel):
    borrower_name: str = "Anonymous"
    annual_income: float = Field(..., description="Annual Income in Rupees")
    monthly_expenses: float = Field(..., description="Monthly basic expenses")
    # Lender now enters the loan amount and tenure; EMI is computed by the backend
    loan_amount: float = Field(..., description="Principal loan amount to be disbursed")
    loan_tenure_months: int = Field(24, description="Repayment tenure in months")
    # Optional: lender can set their own interest rate. If blank, AI suggestion is used.
    lender_interest_rate: Optional[float] = Field(None, description="Lender's own annual interest rate in %")
    young_dependents: int = Field(0, description="Children or young dependents")
    old_dependents: int = Field(0, description="Elderly dependents")
    
    # Categorical Dropdowns from the UI
    social_class: str = Field(..., description="E.g., General, OBC, SC, ST, Minority")
    primary_business: str = Field(..., description="E.g., Agriculture, Food_Trade, Retail_Trade, etc.")
    secondary_business: str = Field("Other", description="Secondary income source")
    home_ownership: float = Field(1.0, description="1 for Owned, 0 for Rented")
    type_of_house: str = Field(..., description="Pucca, Semi_Pucca, Kutcha, Other")
    loan_purpose: str = Field(..., description="Reason for loan")
    water_availabity: float = Field(1.0, description="1 for yes, 0 for no, 0.5 for partial")

    @field_validator('annual_income', 'monthly_expenses', 'loan_amount', 'lender_interest_rate', mode='before')
    def parse_financials(cls, value):
        # Convert empty strings to None/0
        if value == "" or value is None:
            return None
        return float(value)
        
    @field_validator('young_dependents', 'old_dependents', 'loan_tenure_months', mode='before')
    def parse_dependents(cls, value):
        if value == "" or value is None:
            return 0
        return int(float(value)) # Handles "2.0" -> 2


# --- URBAN BUREAU INPUT SCHEMA ---
# Urban modeling uses aggregated bureau features (Credit history, external sources)
# The bank's database provides these 20 precise metrics.
class UrbanBureauInput(BaseModel):
    borrower_name: str = "Anonymous"
    EXT_SOURCE_MEAN: float = 0.5
    NAME_EDUCATION_TYPE_Higher_education: int = Field(0, alias="NAME_EDUCATION_TYPE_Higher education")
    CODE_GENDER: int = 0
    NAME_INCOME_TYPE_Working: int = 1
    CC_UTILISATION_RATIO: float = 0.0
    NAME_INCOME_TYPE_Pensioner: int = 0
    INSTAL_LATE_RATE: float = 0.0
    FLAG_DOCUMENT_3: int = 1
    NAME_CONTRACT_TYPE: int = 0
    FLAG_OWN_CAR: int = 0
    PREV_REFUSAL_RATE: float = 0.0
    NAME_EDUCATION_TYPE_Secondary: int = Field(1, alias="NAME_EDUCATION_TYPE_Secondary / secondary special")
    APARTMENTS_MEDI: float = 0.0
    CREDIT_TERM: float = 12.0
    PREV_APPROVED_COUNT: float = 0.0
    EXT_SOURCE_MIN: float = 0.5
    CC_AVG_BALANCE: float = 0.0
    EXT_SOURCE_1: float = 0.5
    REG_CITY_NOT_LIVE_CITY: int = 0
    DEF_60_CNT_SOCIAL_CIRCLE: float = 0.0

    class Config:
        populate_by_name = True
