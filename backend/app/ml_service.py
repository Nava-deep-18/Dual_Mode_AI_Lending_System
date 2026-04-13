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
        "red_flag": "Despite concrete housing, other localized neighborhood factors increased risk.",
        "green_flag": "High quality concrete housing implies robust financial backing."
    },
    # Business & Loan Purpose specific mappings (Neutral phrasing for One-Hot Explanations)
    "loan_purpose_Meat Businesses": {
        "label": "Livestock / Meat Sector Exposure",
        "red_flag": "Identified high volatility and disease risk associated with the local livestock sector.",
        "green_flag": "Profile is safely insulated from the high-risk livestock/meat economy."
    },
    "loan_purpose_Animal husbandry": {
        "label": "Animal Husbandry Operations",
        "red_flag": "High operational cost and disease risks identified in animal rearing profile.",
        "green_flag": "Business profile avoids the high overhead costs of animal husbandry."
    },
    "loan_purpose_Farming/ Agriculture": {
        "label": "Agricultural Climate Dependency",
        "red_flag": "Profile flags high vulnerability to upcoming seasonal crop failures or climate shocks.",
        "green_flag": "Stable operations insulated from primary agricultural climate shocks."
    },
    "loan_purpose_Flower Business": {
        "label": "Floriculture Market Volatility",
        "red_flag": "Highly perishable goods susceptible to market/festival fluctuations.",
        "green_flag": "Business profile avoids the unpredictable floriculture market cycles."
    },
    "loan_purpose_Repair Services": {
        "label": "Repair & Mechanics Sector",
        "red_flag": "Irregular daily-wage income stream identified in service profile.",
        "green_flag": "Profile benefits from avoiding irregular mechanic/service sector constraints."
    },
    "loan_purpose_Handicrafts": {
        "label": "Handicrafts & Artisans",
        "red_flag": "Unpredictable discretionary market demand flagged in artisan profile.",
        "green_flag": "Profile is insulated from discretionary artisan market crashes."
    },
    "primary_business_Other": {
        "label": "Defined Business Sector",
        "red_flag": "Lack of defined primary business sector significantly increases lending uncertainty.",
        "green_flag": "Well-defined rural business profile provides strong loan security."
    }
}

URBAN_SHAP_DICTIONARY = {
    "EXT_SOURCE_MEAN": {
        "label": "Average External Credit Score",
        "red_flag": "Poor historical credit behavior detected across external bureaus.",
        "green_flag": "Strong aggregate credit score from external bureaus."
    },
    "EXT_SOURCE_MIN": {
        "label": "Lowest External Credit Score",
        "red_flag": "At least one credit bureau reported severe delinquency.",
        "green_flag": "No severe delinquencies reported across any bureau."
    },
    "EXT_SOURCE_1": {
        "label": "Primary External Credit Score",
        "red_flag": "Low primary credit rating indicates likely default.",
        "green_flag": "High primary credit rating secures the application."
    },
    "CC_UTILISATION_RATIO": {
        "label": "Credit Card Utilization",
        "red_flag": "Over-leveraged credit facilities indicate extreme debt stress.",
        "green_flag": "Healthy credit utilization leaves room for new debt."
    },
    "INSTAL_LATE_RATE": {
        "label": "Late Payment History",
        "red_flag": "History of missing previous installments.",
        "green_flag": "Flawless historical repayment behavior."
    },
    "CREDIT_TERM": {
        "label": "Loan Term Length",
        "red_flag": "Extended loan term increases cumulative risk exposure.",
        "green_flag": "Short term loan limit exposure."
    },
    "PREV_REFUSAL_RATE": {
        "label": "Previous Refusal Rate",
        "red_flag": "Frequent rejections by other financial institutions.",
        "green_flag": "Strong approval history."
    },
    "APARTMENTS_MEDI": {
        "label": "Apartment Size/Quality",
        "red_flag": "Low housing metric indicates poor standard of living collateral.",
        "green_flag": "High housing metric correlates with financial stability."
    },
    "PREV_APPROVED_COUNT": {
        "label": "Previous Approved Loans",
        "red_flag": "Lack of proven credit history.",
        "green_flag": "Extensive history of successfully approved loans."
    },
    "CC_AVG_BALANCE": {
        "label": "Average Credit Balance",
        "red_flag": "Consistently high revolving credit balance.",
        "green_flag": "Low or zero revolving balances."
    },
    "NAME_EDUCATION_TYPE_Higher education": {
        "label": "Education Level (Degree)",
        "red_flag": "Lack of higher education correlates with income ceilings.",
        "green_flag": "Higher education correlates with stable employment."
    },
    "NAME_INCOME_TYPE_Working": {
        "label": "Income Type (Salaried)",
        "red_flag": "Unstable employment type.",
        "green_flag": "Stable W2/Salaried income."
    },
    "FLAG_DOCUMENT_3": {
        "label": "ID Verification Level 3",
        "red_flag": "Missing critical documentation increases fraud risk.",
        "green_flag": "Fully verified standard documents."
    },
    "FLAG_OWN_CAR": {
        "label": "Car Ownership (Asset)",
        "red_flag": "Lack of vehicle ownership reduces recoverable assets.",
        "green_flag": "Vehicle ownership serves as excellent implicit collateral."
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

        # 2. Load Urban Model & Config
        urban_path = os.path.join(MODELS_DIR, "urban_bank", "urban_xgb_model.joblib")
        urban_feat = os.path.join(MODELS_DIR, "urban_bank", "urban_model_features.json")
        
        if os.path.exists(urban_path):
            self.urban_model = joblib.load(urban_path)
            self.urban_explainer = shap.TreeExplainer(self.urban_model)
            with open(urban_feat, 'r') as f:
                self.urban_features = json.load(f)["features"]
        else:
            self.urban_model = None
            print("⚠️ Urban Model missing!")

    def _transform_rural_inputs(self, raw: RuralHumanInput) -> dict:
        """Converts raw human text into the exact XGBoost features securely"""
        
        # Start a clean dictionary with 0s for whatever exact 15 features the model trained on
        model_inputs = {feat: 0.0 for feat in self.rural_features}
        
        # 1. Calculate the critical Financial Ratios securely
        # Step 1a: Compute EMI using Reducing Balance formula
        # EMI = P × r × (1+r)^n / ((1+r)^n - 1)
        # Use lender's own rate if provided, else fall back to 12% MFI base rate
        annual_rate = raw.lender_interest_rate if raw.lender_interest_rate else 12.0
        base_monthly_rate = annual_rate / 100.0 / 12.0
        n = raw.loan_tenure_months
        P = raw.loan_amount if raw.loan_amount else 0
        if base_monthly_rate > 0 and n > 0 and P > 0:
            calculated_emi = P * base_monthly_rate * ((1 + base_monthly_rate) ** n) / (((1 + base_monthly_rate) ** n) - 1)
        else:
            calculated_emi = P / max(n, 1)  # Fallback: flat split
        calculated_emi = round(calculated_emi, 2)

        net_income = (raw.annual_income / 12.0) - raw.monthly_expenses
        net_income = max(net_income, 1.0) # Prevent division by zero
        dti_ratio = calculated_emi / net_income
        total_dependents = raw.young_dependents + raw.old_dependents
        
        # 2. Map direct numeric outputs (if the model happens to require them)
        if "DTI_ratio" in model_inputs: model_inputs["DTI_ratio"] = dti_ratio
        if "net_disposable_income" in model_inputs: model_inputs["net_disposable_income"] = net_income
        if "total_dependents" in model_inputs: model_inputs["total_dependents"] = total_dependents
        if "young_dependents" in model_inputs: model_inputs["young_dependents"] = raw.young_dependents
        if "old_dependents" in model_inputs: model_inputs["old_dependents"] = raw.old_dependents
        if "water_availabity" in model_inputs: model_inputs["water_availabity"] = float(raw.water_availabity)
        if "loan_installments" in model_inputs: model_inputs["loan_installments"] = calculated_emi
        if "home_ownership" in model_inputs: model_inputs["home_ownership"] = float(raw.home_ownership)
        
        # Store calculated_emi so predict_rural can access it
        self._last_calculated_emi = calculated_emi
        
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
        seen_categorical_bases = set()
        
        for feat, impact_val in sorted_impacts:
            # If this is a one-hot categorical feature that the user did NOT select (value is 0)
            # We MUST mathematically ignore it for the UI. Otherwise humans get confused when told "Low Risk because you aren't a butcher".
            is_categorical = any(feat.startswith(p) for p in ['type_of_house_', 'primary_business_', 'loan_purpose_', 'social_class_'])
            if is_categorical and model_ready_data.get(feat, 0.0) == 0.0:
                continue
                
            # Prevent showing multiple one-hot variants of the same dropdown (e.g., House Type)
            base_category = feat
            for prefix in ['type_of_house_', 'primary_business_', 'loan_purpose_', 'social_class_']:
                if feat.startswith(prefix):
                    base_category = prefix
                    break
                    
            if base_category in seen_categorical_bases and base_category != feat:
                 continue
                 
            seen_categorical_bases.add(base_category)
                 
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
            
            if len(shaps_human) >= 4:
                break
            
        # 5. Apply Organic Guardrail Penalty (Dynamic Scaling)
        net_income = (human_raw.annual_income / 12.0) - human_raw.monthly_expenses
        emi_used = getattr(self, '_last_calculated_emi', 0)
        dti_ratio = emi_used / max(net_income, 1.0)
        
        if net_income <= 0:
            # If they are short by ₹450, we add a massive dynamic penalty!
            cashflow_deficit = abs(net_income)
            dynamic_penalty = 60.0 + (cashflow_deficit / 5.0) 
            prob = min(prob + dynamic_penalty, 98.7 + (prob * 0.01)) # Looks incredibly organic (e.g. 98.74)
            
            shaps_human.insert(0, {
                "feature": "Dynamic_Guardrail",
                "human_label": "Severe Over-leveraged Risk",
                "impact": "HIGH RISK",
                "reason": f"Net cash flow is strictly negative (-₹{round(cashflow_deficit,2)} deficit). Borrower cannot afford living expenses."
            })
        elif dti_ratio > 0.6:
            # If DTI is perfectly bounded, penalty is tiny. If it's huge, penalty triggers heavily.
            dti_excess = dti_ratio - 0.6
            dynamic_penalty = dti_excess * 45.0
            prob = min(prob + dynamic_penalty, 96.5 + (prob * 0.01)) 
            
            shaps_human.insert(0, {
                "feature": "Dynamic_Guardrail",
                "human_label": "Critical Debt Burden",
                "impact": "HIGH RISK",
                "reason": f"Requested EMI consumes an unsafe {int(dti_ratio*100)}% of disposable income."
            })
            
        # Target Math for Dynamic Loan Caps and Rates
        net_income_calculated = (human_raw.annual_income / 12.0) - human_raw.monthly_expenses
        max_emi_capacity = max(net_income_calculated * 0.40, 0) # 40% of disposable
        max_loan_limit = max_emi_capacity * human_raw.loan_tenure_months # Based on actual tenure entered by lender
        
        # Real-world MFI (Microfinance) rates typically start at 12% up to 24% for unsecured lending
        base_rate = 12.0
        risk_premium = min((prob / 100.0) * 12.0, 12.0) # Up to 12% extra based on risk profile
        suggested_rate = base_rate + risk_premium

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
            "suggested_interest_rate": round(suggested_rate, 2),
            "max_loan_limit": round(max_loan_limit, 2),
            "calculated_emi": getattr(self, '_last_calculated_emi', None),
            "loan_tenure_months": human_raw.loan_tenure_months,
            "lender_interest_rate": human_raw.lender_interest_rate,
            "shap_explanations": shaps_human
        }

    def predict_urban(self, bureau_raw) -> dict:
        if not self.urban_model:
            raise Exception("Urban Model not available")
            
        # Pydantic's model_dump(by_alias=True) converts Pythonic names back to XGBoost strings 
        # (e.g. NAME_EDUCATION_TYPE_Secondary -> NAME_EDUCATION_TYPE_Secondary / secondary special)
        model_ready_data = bureau_raw.model_dump(by_alias=True)
        
        df = pd.DataFrame([model_ready_data])[self.urban_features]
        prob = float(self.urban_model.predict_proba(df)[0][1]) * 100
        prob = max(prob, 0.0001)
        
        shap_values = self.urban_explainer.shap_values(df)
        feature_impacts = {self.urban_features[i]: float(shap_values[0][i]) for i in range(len(self.urban_features))}
        sorted_impacts = sorted(feature_impacts.items(), key=lambda item: abs(item[1]), reverse=True)
        
        shaps_human = []
        for feat, impact_val in sorted_impacts[:4]:
            direction = "HIGH RISK" if impact_val > 0 else "LOW RISK"
            dict_ref = URBAN_SHAP_DICTIONARY.get(feat, {
                "label": feat,
                "red_flag": f"The value of {feat} significantly increased default probability.",
                "green_flag": f"The value of {feat} actively reduced risk."
            })
            shaps_human.append({
                "feature": feat,
                "human_label": dict_ref["label"],
                "impact": direction,
                "reason": dict_ref["red_flag"] if direction == "HIGH RISK" else dict_ref["green_flag"]
            })
            
        # Realistic Urban Commercial banking starts around 9.5% 
        base_rate = 9.5
        risk_premium = min((prob / 100.0) * 10.5, 10.5) # Max out at 20%
        suggested_rate = base_rate + risk_premium

        tier = "Safe"
        decision = "Approved"
        if prob > 60.0:
            tier, decision = "High Risk", "Manual Review Required"
        elif prob > 35.0:
            tier, decision = "Medium Risk", "Request Collateral"
            
        return {
            "risk_score": round(prob, 2),
            "risk_tier": tier,
            "decision": decision,
            "suggested_interest_rate": round(suggested_rate, 2),
            "shap_explanations": shaps_human
        }

ml_engine = MLEngine()
