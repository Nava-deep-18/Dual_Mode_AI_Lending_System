# AI-Based Loan Risk Assessment and Decision Support System

## 🎯 The Vision
A **Dual-Mode Intelligent Lending Platform** that provides highly accurate, data-driven loan decisions. It goes beyond prediction by offering **Decision Support** (Explainable AI) to loan officers, specifically catering to both **Urban Commercial Banks** and **Rural Microfinance Institutions (MFIs)**.

---

## 🏗️ Core Architecture (Dual-Mode System)

The system is split into two distinct modules, ensuring that the machine learning models and the user interface cater specifically to the type of borrower.

### Module A: Urban Commercial Banking
* **Target:** Traditional borrowers with credit histories.
* **Input Data (UI):** CIBIL Score, Debt-to-Income, W2/Salary, Mortgage history, etc.
* **ML Model:** Trained on standard credit default datasets (e.g., LendingClub, German Credit).

### Module B: Rural Microfinance 
* **Target:** Unbanked/Underbanked populations, small loan amounts.
* **Input Data (UI):** Alternative data (Daily wage, agriculture yield, group guarantor, household dependents).
* **ML Model:** Trained on financial inclusion and alternative lending datasets (e.g., Kiva, localized NGO default data).

---

## 💻 Tech Stack & Project Structure

1. **Frontend (User Interface):** 
   * React (Vite) + Tailwind CSS / Vanilla CSS.
   * Features: Premium design, Dual-Mode selection (Bank vs. MFI), Borrower Evaluation Forms, Risk Dashboards, and Visual AI Explanation (SHAP).

2. **Backend (API):** 
   * Python (FastAPI).
   * Features: Rest API endpoints (`/predict/urban`, `/predict/rural`), loads pre-trained models.

3. **Machine Learning (Intelligence):**
   * Python (Jupyter Notebooks, Scikit-Learn, XGBoost/Random Forest).
   * Features: Two separate `.pkl`/`.joblib` models. Emphasizes **SHAP (SHapley Additive exPlanations)** to tell the lender *why* a borrower is risky.

---

## 🚦 Phased Development Plan

*   **Phase 1: Data & Modeling (Data Science)**
    *   Acquire Urban dataset (Traditional) and Rural dataset (Alternative).
    *   Setup `notebooks/` to clean, engineer features, and handle class imbalances.
    *   Train Model A and Model B; compute SHAP explainers; save models to `backend/ml_models/`.
*   **Phase 2: Backend Development (API Route)**
    *   Build FastAPI application to wrap the models and expose inference endpoints.
*   **Phase 3: Frontend Development (The Portal)**
    *   Build the React architecture with the dual landing pages.
    *   Connect forms to the backend API.
*   **Phase 4: Decision Support & Polish (Explainability)**
    *   Build the UI components that graphically show the SHAP values (e.g., "Risk is high because: Debt is 40% of income").

*(Note: Dynamic Retraining / Time-series behavioral scoring is out-of-scope for Version 1, but UI room is left for "Borrower Tracking" later).*
