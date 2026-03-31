import joblib
import json
import os
import pandas as pd
import shap
from schemas import RuralHumanInput

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "ml_models")

# --- SHAP Translation Dictionary for beautiful Human Sentences ---
RURAL_SHAP_DICTIONARY = {
    "DTI_ratio": {
        "label": "Debt-to-Income",
        "red_flag": "Installment consumes an unsafe amount of disposable income.",
        "green_flag": "Strong disposable income left over after paying installment."
    },
    "net_disposable_income": {
        "label": "Net Disposable Cash Flow",
        "red_flag": "Critically low monthly cash flow after basic living expenses.",
        "green_flag": "Healthy buffer of disposable income provides excellent loan security."
    },
    "total_dependents": {
        "label": "Total Dependents",
        "red_flag": "High number of dependents increases financial strain.",
        "green_flag": "Low number of dependents ensures steady cash flow."
    },
    "young_dependents": {
        "label": "Young Children",
        "red_flag": "High number of young children introduces immediate future cost liabilities.",
        "green_flag": "Low dependent costs."
    },
    "home_ownership": {
        "label": "Asset Collateral (Owned Home)",
        "red_flag": "Lack of home ownership indicates high flight risk and zero physical collateral.",
        "green_flag": "Owning their house secures the borrower's permanent asset base."
    },
    "type_of_house_Semi_Pucca": {
        "label": "Home Quality (Semi-Pucca)",
        "red_flag": "Semi-permanent housing shows moderate structural vulnerability.",
        "green_flag": "Adequate, stable housing."
    },
    "type_of_house_Other": {
        "label": "Temporary Housing (Kutcha)",
        "red_flag": "Temporary/Kutcha housing indicates extreme poverty and low asset stability.",
        "green_flag": "N/A"
    },
    "type_of_house_Pucca": {
        "label": "Premium House Quality (Pucca)",
        "red_flag": "N/A",
        "green_flag": "High quality concrete housing implies robust financial backing."
    },
    # Business & Loan Purpose specific mappings
    "loan_purpose_Meat Businesses": {
        "label": "Livestock / Meat Economy",
        "red_flag": "Meat trade sector historically correlates with high volatility/disease risk.",
        "green_flag": "Profitable local meat economy."
    },
    "loan_purpose_Animal husbandry": {
        "label": "Animal Husbandry",
        "red_flag": "High operational cost and disease risk in animal rearing.",
        "green_flag": "Steady income generation from cattle/livestock."
    },
    "loan_purpose_Farming/ Agriculture": {
        "label": "Agriculture Sector",
        "red_flag": "High vulnerability to seasonal crop failure and climate shocks.",
        "green_flag": "Stable agricultural operations."
    },
    "loan_purpose_Flower Business": {
        "label": "Floriculture",
        "red_flag": "Highly perishable goods susceptible to market/festival fluctuations.",
        "green_flag": "Lucrative margins in short harvest cycles."
    },
    "loan_purpose_Repair Services": {
        "label": "Repair & Mechanics",
        "red_flag": "Irregular daily-wage income stream.",
        "green_flag": "Consistent service economy demand."
    },
    "loan_purpose_Handicrafts": {
        "label": "Handicrafts & Artisans",
        "red_flag": "Unpredictable discretionary market demand.",
        "green_flag": "Strong artisan cooperative support."
    },
    "primary_business_Other": {
        "label": "Uncategorized Business",
        "red_flag": "Lack of defined business sector increases uncertainty.",
        "green_flag": "Diversified rural income."
    }
}

class MLEngine:
    def __init__(self):
        print("Initializing Machine Learning Engine...")
        
        # 1. Load Rural Model & Config
        rural_path = os.path.join(MODELS_DIR, "rural_microfinance", "rural_xgb_model.joblib")
        rural_feat = os.path.join(MODELS_DIR, "rural_microfinance", "rural_model_features.json")
        
        if os.path.exists(rural_path):
            self.rural_model = joblib.load(rural_path)
            self.rural_explainer = shap.TreeExplainer(self.rural_model)
            with open(rural_feat, 'r') as f:
                self.rural_features = json.load(f)["features"]
        else:
            self.rural_model = None
            print("⚠️ Rural Model missing!")

    def _transform_rural_inputs(self, raw: RuralHumanInput) -> dict:
        """Converts raw human text into the exact XGBoost features securely"""
        
        # Start a clean dictionary with 0s for whatever exact 15 features the model trained on
        model_inputs = {feat: 0.0 for feat in self.rural_features}
        
        # 1. Calculate the critical Financial Ratios securely
        net_income = (raw.annual_income / 12.0) - raw.monthly_expenses
        net_income = max(net_income, 1.0) # Prevent division by zero
        dti_ratio = raw.loan_installments / net_income
        total_dependents = raw.young_dependents + raw.old_dependents
        
        # 2. Map direct numeric outputs (if the model happens to require them)
        if "DTI_ratio" in model_inputs: model_inputs["DTI_ratio"] = dti_ratio
        if "net_disposable_income" in model_inputs: model_inputs["net_disposable_income"] = net_income
        if "total_dependents" in model_inputs: model_inputs["total_dependents"] = total_dependents
        if "young_dependents" in model_inputs: model_inputs["young_dependents"] = raw.young_dependents
        if "old_dependents" in model_inputs: model_inputs["old_dependents"] = raw.old_dependents
        if "water_availabity" in model_inputs: model_inputs["water_availabity"] = float(raw.water_availabity)
        if "loan_installments" in model_inputs: model_inputs["loan_installments"] = float(raw.loan_installments)
        if "home_ownership" in model_inputs: model_inputs["home_ownership"] = float(raw.home_ownership)
        
        # 3. Handle Categoricals natively (Checking Dropdowns)
        sc = str(raw.social_class).strip().upper()
        pb = str(raw.primary_business).strip()
        sb = str(raw.secondary_business).strip()
        th = str(raw.type_of_house).strip().upper()
        lp = str(raw.loan_purpose).strip()
        
        # 4. Programmatic One-Hot Evaluation 
        for feat in self.rural_features:
            # We explicitly check our dropdown values against the specific XGBoost feature column name
            if feat.startswith("social_class_") and sc in feat.upper():
                model_inputs[feat] = 1.0
            elif feat.startswith("primary_business_") and pb.lower() in feat.lower():
                model_inputs[feat] = 1.0
            elif feat.startswith("secondary_business_") and sb.lower() in feat.lower():
                model_inputs[feat] = 1.0
            elif feat.startswith("type_of_house_") and th in feat.upper():
                model_inputs[feat] = 1.0
            elif feat.startswith("loan_purpose_") and lp.lower() in feat.lower():
                model_inputs[feat] = 1.0
                
        # Fix specific known "Other/Exceptional" groupings
        if "type_of_house_Other" in model_inputs and th not in ['PUCCA', 'PUCCA', 'SEMI_PUCCA']:
            model_inputs["type_of_house_Other"] = 1.0
        if "primary_business_Other" in model_inputs and pb.lower() in ['none', 'other']:
            model_inputs["primary_business_Other"] = 1.0
            
        return model_inputs

    def predict_rural(self, human_raw: RuralHumanInput) -> dict:
        if not self.rural_model:
            raise Exception("Rural Model not available")
            
        # 1. Pipeline Transformation
        model_ready_data = self._transform_rural_inputs(human_raw)
        
        # 2. Score with strict alignment to model feature array
        df = pd.DataFrame([model_ready_data])[self.rural_features]
        prob = float(self.rural_model.predict_proba(df)[0][1]) * 100
        prob = max(prob, 0.0001)  # Prevent zero masking
        
        # 3. Extract SHAP local explanations
        shap_values = self.rural_explainer.shap_values(df)
        
        # Match SHAP weights to features, sorting by absolute strength
        feature_impacts = {self.rural_features[i]: float(shap_values[0][i]) for i in range(len(self.rural_features))}
        sorted_impacts = sorted(feature_impacts.items(), key=lambda item: abs(item[1]), reverse=True)
        
        # 4. Translate top 3 SHAP impacts into Human Text Responses
        shaps_human = []
        for feat, impact_val in sorted_impacts[:4]: # Grab top 4 drivers
            # Positive shap drives risk UP (Red flag), Negative drives risk DOWN (Green flag)
            direction = "HIGH RISK" if impact_val > 0 else "LOW RISK"
            
            dict_ref = RURAL_SHAP_DICTIONARY.get(feat, {
                "label": feat,
                "red_flag": f"The value of {feat} drastically increased risk.",
                "green_flag": f"The value of {feat} significantly secured the loan."
            })
            
            shaps_human.append({
                "feature": feat,
                "human_label": dict_ref["label"],
                "impact": direction,
                "reason": dict_ref["red_flag"] if direction == "HIGH RISK" else dict_ref["green_flag"]
            })
            
        # Business Logic Routing
        tier = "Safe"
        decision = "Approved"
        if prob > 65.0:
            tier, decision = "High Risk", "Manual Review Required"
        elif prob > 40.0:
            tier, decision = "Medium Risk", "Review Conditions"
            
        return {
            "risk_score": round(prob, 2),
            "risk_tier": tier,
            "decision": decision,
            "shap_explanations": shaps_human
        }

ml_engine = MLEngine()
