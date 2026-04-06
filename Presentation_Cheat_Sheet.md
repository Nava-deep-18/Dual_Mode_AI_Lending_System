# AI Lending System: Feature Explanations & Risk Impact Guide
*A beginner-friendly cheat sheet for your presentation to explain exactly what every slider and input does.*

---

## 🏙️ Urban Commercial Bank Features (CIBIL Simulator)

### 1. The Core CIBIL Proxies (`EXT_SOURCE_MEAN`, `MIN`, `SOURCE_1`)
*   **What it means:** These are aggregated credit scores gathered from 3 external national bureaus (like CIBIL, Equifax, Experian). The values scale from `0.0` (Terrible) to `1.0` (Perfect).
*   **Effect on Risk:** **INCREASING** this slider safely **DECREASES** risk drastically. (0.85 is great, 0.10 is instant reject).

### 2. Credit Card Utilization (`CC_UTILISATION_RATIO`)
*   **What it means:** What percentage of their total credit card limit they are currently spending (e.g., spending ₹90k out of a ₹100k limit = 90% or 0.90).
*   **Effect on Risk:** **INCREASING** this slider **INCREASES** risk heavily. Over 70% shows they are running out of money.

### 3. Late Payment Rate (`INSTAL_LATE_RATE`)
*   **What it means:** The percentage of times they paid their past loan EMIs late (e.g., 0.20 means they were late on 20% of their historical bills).
*   **Effect on Risk:** **INCREASING** this slider **INCREASES** risk massively. 

### 4. Previous Rejection Rate (`PREV_REFUSAL_RATE`)
*   **What it means:** Looking at their historical applications to *other* banks, how often were they rejected? 
*   **Effect on Risk:** **INCREASING** this slider **INCREASES** risk. If other banks rejected them, the AI gets highly suspicious.

### 5. Requested Term (`CREDIT_TERM`)
*   **What it means:** How many months they want to take to pay the loan back (12 months vs 120 months).
*   **Effect on Risk:** **INCREASING** the term length generally **INCREASES** risk, because a longer timeline gives more chances for life emergencies (job loss, sickness) to cause a default.

### 6. Prev. Approved Loans (`PREV_APPROVED_COUNT`)
*   **What it means:** How many loans they successfully applied for in the past.
*   **Effect on Risk:** **INCREASING** this number safely **DECREASES** risk, as it proves they are a financially active, trusted participant in the banking system.

### 7. CC Avg Balance (`CC_AVG_BALANCE`)
*   **What it means:** The raw average amount of outstanding revolving debt carried on their credit cards month-to-month.
*   **Effect on Risk:** **INCREASING** this balance **INCREASES** risk. Large standing debt is dangerous.

### 8. Social Circle Defaults (`DEF_60_CNT_SOCIAL_CIRCLE`)
*   **What it means:** Have the applicant's friends, family, or neighbors defaulted on loans recently? Banks look at their zip code and associated phone contacts.
*   **Effect on Risk:** **INCREASING** this number significantly **INCREASES** risk. Poverty and financial distress are statistically contagious. Having a `3` here is very toxic.

### 9. Apartment Quality (`APARTMENTS_MEDI`)
*   **What it means:** A metric from 0 to 1 representing the property value and neighborhood quality of where they live.
*   **Effect on Risk:** **INCREASING** this score **DECREASES** risk, as a high quality home acts as solid physical collateral.

### 10. Categorical Flags (Yes/No)
*   **Vehicle Ownership:** Selecting **Yes** safely **DECREASES** risk (Car = valuable collateral asset).
*   **KYC Document 3:** Selecting **Missing** safely **INCREASES** risk (Lack of verified identity).
*   **Address Mismatch:** Selecting **Mismatch Detected** significantly **INCREASES** risk (Potential fraud flag if their registered ID address doesn't match where they currently live).
*   **Higher Education:** Selecting **Yes** statistically **DECREASES** risk (Correlation with steady white-collar income).

---

## 🌾 Rural Microfinance Features

### 1. Annual Income & Monthly Expenses
*   **What it means:** Total yearly cash flow, minus what they spend per month on living. 
*   **Effect on Risk:** **INCREASING** Income sharply **DECREASES** risk. **INCREASING** Expenses sharply **INCREASES** risk. (This forms their Net Cash Flow).

### 2. Expected EMI (Loan Installments)
*   **What it means:** The monthly loan payment they are asking for.
*   **Effect on Risk:** **INCREASING** the EMI heavily **INCREASES** risk, especially if it exceeds their disposable net cash flow (Debt-to-Income constraint).

### 3. Dependents (Young & Old)
*   **What it means:** The number of children (Young) and elderly parents (Old) the borrower must feed and pay medical bills for.
*   **Effect on Risk:** **INCREASING** dependents always **INCREASES** risk in microfinance, as it drains disposable income rapidly in emergencies.

### 4. Type of House & Home Ownership
*   **What it means:** Pucca (Strong Concrete), Semi-Pucca (Mixed), or Kutcha (Temporary Mud/Straw). 
*   **Effect on Risk:** Having **Pucca** and **Owned** drastically **DECREASES** risk, because a concrete house cannot be destroyed by a monsoon, preserving the borrower's capital.

### 5. Water/Utility Access
*   **What it means:** Reliability of infrastructure.
*   **Effect on Risk:** **NO ACCESS** heavily **INCREASES** risk. Micro-businesses (like Dairy or Agriculture) will fail immediately without water.

### 6. Primary Business & Loan Purpose
*   **What it means:** What sector they work in (Agriculture, Meat, Floriculture, etc).
*   **Effect on Risk:** Volatile sectors with short shelf-lives or disease risks (like **Meat Businesses** or **Floriculture**) naturally **INCREASE** risk. Stable service sectors or Handicrafts might offer better security. 
