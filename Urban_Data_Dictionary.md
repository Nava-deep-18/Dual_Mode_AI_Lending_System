# 🏙️ Urban Commercial Bank: Complete Dataset & Feature Dictionary

This document provides a comprehensive, jargon-free breakdown of all **7 relational CSV files** and **every raw feature** within the Urban Commercial Bank pipeline (based on the Home Credit Default Risk benchmark).

---

## 🗺️ The Big Picture: Relational Architecture

All 7 tables connect to the primary applicant profile using the unique identifier **`SK_ID_CURR`** (equivalent to an Aadhaar Number or Universal Customer ID).

```
                 ┌──────────────────────────────────────────────────────────┐
                 │                application_train.csv                     │
                 │   (The Main File: Who is the person applying right now?)  │
                 └────────────────────────────┬─────────────────────────────┘
                                              │
         ┌────────────────────────┬───────────┴───────────┬────────────────────────┐
         │                        │                       │                        │
         ▼                        ▼                       ▼                        ▼
  [bureau.csv]         [previous_application.csv]  [installments_payments.csv] [credit_card_balance.csv]
  (Did they borrow     (Did they apply to          (Did they pay their past    (Are they maxing out
  from OTHER banks?)    OUR bank before?)          bills on time or late?)     their credit cards?)
         │
         ▼
[bureau_balance.csv]
(Month-by-month status
of those other loans)
```

---

## 1. `bureau_balance.csv` (Monthly History at Other Banks)
*Tracks the month-by-month payment behavior for past loans taken at external financial institutions.*

| Feature Name | Plain-English Meaning & Financial Role |
| :--- | :--- |
| **`SK_BUREAU_ID`** | The unique identifier of the specific loan taken at another bank. |
| **`MONTHS_BALANCE`** | How many months ago this record is from (`0` = this month, `-1` = last month, `-12` = a year ago). |
| **`STATUS`** | The borrower's monthly payment status:<br>• `C` = **Closed** (loan fully paid off).<br>• `0` = **On Time** (0 days late).<br>• `1` = **1 to 30 days late**.<br>• `2` = **31 to 60 days late**.<br>• `3` = **61 to 90 days late**.<br>• `4` = **91 to 120 days late**.<br>• `5` = **120+ days late or written off** (severe delinquency).<br>• `X` = Status unknown / not reported. |

---

## 2. `installments_payments.csv` (Past Bill-Payment Receipts)
*Tracks every single payment due date vs. actual money received for historical loans.*

| Feature Name | Plain-English Meaning & Financial Role |
| :--- | :--- |
| **`SK_ID_PREV`** | ID of the previous loan contract within this bank. |
| **`SK_ID_CURR`** | The applicant's unique customer ID. |
| **`NUM_INSTALMENT_VERSION`** | Schedule version (`0` = credit card, `1+` = normal loan schedule; version changes indicate repayment restructuring or loan rescheduling). |
| **`NUM_INSTALMENT_NUMBER`** | The sequential installment cycle (Installment #1, #2, #12, etc.). |
| **`DAYS_INSTALMENT`** | The target due date when the borrower **should have** paid (measured in negative days before current application). |
| **`DAYS_ENTRY_PAYMENT`** | The actual date when the borrower **actually paid**. If `DAYS_ENTRY_PAYMENT > DAYS_INSTALMENT`, the payment was **late**. |
| **`AMT_INSTALMENT`** | The billed amount: how much the borrower was scheduled to pay. |
| **`AMT_PAYMENT`** | The receipt amount: how much was actually credited (underpayment indicates liquidity strain). |

---

## 3. `POS_CASH_balance.csv` (Store Purchase Installments)
*Tracks monthly status of point-of-sale consumer finance loans (e.g., buying a smartphone or TV on EMI).*

| Feature Name | Plain-English Meaning & Financial Role |
| :--- | :--- |
| **`SK_ID_PREV`** | ID of the store loan contract. |
| **`SK_ID_CURR`** | The applicant's unique customer ID. |
| **`MONTHS_BALANCE`** | Which month this record is from (`-1` = last month, `-6` = 6 months ago). |
| **`CNT_INSTALMENT`** | Total number of installments agreed upon in the tenure. |
| **`CNT_INSTALMENT_FUTURE`** | Remaining installments left to pay before loan maturity. |
| **`NAME_CONTRACT_STATUS`** | Status of the store loan (*Active, Completed, Signed, Returned, or Demand [legal recovery]*). |
| **`SK_DPD`** | **Days Past Due**: Number of days overdue on that month's installment. |
| **`SK_DPD_DEF`** | **Days Past Due (with tolerance)**: Days overdue ignoring minor grace periods or small negligible differences. |

---

## 4. `bureau.csv` (Credit History from Other Banks / CIBIL)
*One row per loan the applicant has taken at ANY external financial institution in the past.*

| Feature Name | Plain-English Meaning & Financial Role |
| :--- | :--- |
| **`SK_ID_CURR`** | The applicant's unique customer ID. |
| **`SK_BUREAU_ID`** | The external credit bureau record ID. |
| **`CREDIT_ACTIVE`** | Is this external loan still ongoing (*Active*) or finished (*Closed*)? |
| **`CREDIT_CURRENCY`** | Currency of the external credit agreement. |
| **`DAYS_CREDIT`** | How many days ago the borrower took this external loan. |
| **`CREDIT_DAY_OVERDUE`** | How many days the loan is currently overdue right now. |
| **`DAYS_CREDIT_ENDDATE`** | Scheduled maturity date of the external loan. |
| **`DAYS_ENDDATE_FACT`** | Actual date when the external loan ended (blank if still active). |
| **`AMT_CREDIT_MAX_OVERDUE`**| The highest historical overdue balance accumulated on this loan. |
| **`CNT_CREDIT_PROLONG`** | How many times the borrower requested tenure extensions due to inability to pay. |
| **`AMT_CREDIT_SUM`** | Total loan amount approved by the external lender. |
| **`AMT_CREDIT_SUM_DEBT`** | Total outstanding debt **still owed** on this loan today. |
| **`AMT_CREDIT_SUM_LIMIT`** | Credit card credit limit reported by the external lender. |
| **`AMT_CREDIT_SUM_OVERDUE`**| Current overdue amount pending immediate payment. |
| **`CREDIT_TYPE`** | Credit line category (*Consumer credit, Credit card, Car loan, Mortgage, Business loan*). |
| **`DAYS_CREDIT_UPDATE`** | How recently the external bureau received updated data for this loan. |
| **`AMT_ANNUITY`** | Monthly installment (EMI) of this external loan. |

---

## 5. `credit_card_balance.csv` (Credit Card Spending Habits)
*Tracks monthly revolving credit card statements and spending discipline.*

| Feature Name | Plain-English Meaning & Financial Role |
| :--- | :--- |
| **`SK_ID_PREV` & `SK_ID_CURR`** | Account ID and Applicant ID. |
| **`MONTHS_BALANCE`** | Statement snapshot month (`-1` = last month, `-3` = 3 months ago). |
| **`AMT_BALANCE`** | Total outstanding balance owed on the card at month-end. |
| **`AMT_CREDIT_LIMIT_ACTUAL`** | Approved credit limit of the card (e.g., ₹1,00,000). |
| **`AMT_DRAWINGS_ATM_CURRENT`**| Total cash withdrawn from ATMs via credit card this month (*critical distress flag*). |
| **`AMT_DRAWINGS_CURRENT`** | Total cumulative spend on the card during the month. |
| **`AMT_DRAWINGS_OTHER_CURRENT`** | Miscellaneous non-POS card transactions. |
| **`AMT_DRAWINGS_POS_CURRENT`** | Total spend swiping the card at merchant checkout points. |
| **`AMT_INST_MIN_REGULARITY`** | Minimum monthly repayment required by the issuer. |
| **`AMT_PAYMENT_CURRENT`** | Amount paid by the borrower toward their card balance this month. |
| **`AMT_PAYMENT_TOTAL_CURRENT`**| Total payments made including late fees and finance charges. |
| **`AMT_RECEIVABLE_PRINCIPAL`** | Pure principal outstanding balance, excluding interest penalties. |
| **`AMT_RECIVABLE` / `AMT_TOTAL_RECEIVABLE`** | Total outstanding liability including interest and penalties. |
| **`CNT_DRAWINGS_ATM_CURRENT`**| Number of ATM cash withdrawal transactions. |
| **`CNT_DRAWINGS_CURRENT`** | Total number of card purchase transactions. |
| **`CNT_DRAWINGS_POS_CURRENT`**| Number of retail merchant swipe transactions. |
| **`CNT_INSTALMENT_MATURE_CUM`** | Total lifetime billing cycles completed on this credit card. |
| **`NAME_CONTRACT_STATUS`** | Status of the card account (*Active, Completed, Suspended, Refused*). |
| **`SK_DPD` & `SK_DPD_DEF`** | Days past due (late payment) on the card bill. |

---

## 6. `previous_application.csv` (Prior History at OUR Bank)
*Tracks all previous loan applications submitted to this specific institution.*

| Category | Features & Plain-English Explanations |
| :--- | :--- |
| **Identifiers** | • **`SK_ID_PREV`**: Identifier of the previous application.<br>• **`SK_ID_CURR`**: Customer ID. |
| **Amounts Requested vs. Approved** | • **`AMT_APPLICATION`**: Principal amount originally requested.<br>• **`AMT_CREDIT`**: Actual loan principal approved by the underwriter.<br>• **`AMT_DOWN_PAYMENT`**: Upfront down-payment contributed by borrower.<br>• **`AMT_GOODS_PRICE`**: Price of goods financed.<br>• **`AMT_ANNUITY`**: Monthly EMI agreed upon. |
| **Institutional Decision** | • **`NAME_CONTRACT_STATUS`**: Outcome (*Approved, Refused, Canceled, Unused*).<br>• **`CODE_REJECT_REASON`**: Primary justification for past rejection (*SCO, LIMIT, HC, VERIF*). Used to calculate `PREV_REFUSAL_RATE`. |
| **Interest Pricing** | • **`RATE_DOWN_PAYMENT`**: Down-payment percentage.<br>• **`RATE_INTEREST_PRIMARY` / `RATE_INTEREST_PRIVILEGED`**: Applicable interest rates charged. |
| **Contract & Category** | • **`NAME_CONTRACT_TYPE`**: Cash loan vs. consumer store credit.<br>• **`NAME_CASH_LOAN_PURPOSE`**: Stated purpose (repairs, healthcare, wedding).<br>• **`NAME_GOODS_CATEGORY`**: Financed category (Mobile, Computers, Vehicles, Furniture). |
| **Sales Channel** | • **`CHANNEL_TYPE`**: Acquisition route (Direct branch, Merchant POS, Online).<br>• **`NAME_SELLER_INDUSTRY`**: Commercial sector of the retail partner.<br>• **`SELLERPLACE_AREA`**: Square footage of the merchant's physical showroom. |
| **Timeline & Lifecycle** | • **`DAYS_DECISION`**: Days ago the underwriting decision was executed.<br>• **`CNT_PAYMENT`**: Approved loan tenure in months.<br>• **`DAYS_FIRST_DRAWING`**: Disbursement timestamp.<br>• **`DAYS_FIRST_DUE`**: First scheduled EMI due date.<br>• **`DAYS_LAST_DUE_1ST_VERSION`**: Originally planned final maturity date.<br>• **`DAYS_LAST_DUE`**: Actual final payment date.<br>• **`DAYS_TERMINATION`**: Date contract was legally terminated/settled.<br>• **`NFLAG_INSURED_ON_APPROVAL`**: Whether borrower purchased credit insurance. |

---

## 7. `application_{train|test}.csv` (The Master Application Form - 122 Features)

This is the primary applicant table. The 122 features are organized into 13 logical groups below:

### Group 1: Ground Truth Target & ID (2 features)
* **`SK_ID_CURR`**: Universal applicant ID.
* **`TARGET`**: **Ground-truth default label** (`1` = Client encountered severe payment difficulties/defaulted; `0` = Client successfully repaid on time). *Present only in train dataset.*

### Group 2: Loan Terms (4 features)
* **`NAME_CONTRACT_TYPE`**: Revolving credit facility vs. standard term cash loan.
* **`AMT_CREDIT`**: Total loan amount requested.
* **`AMT_ANNUITY`**: Monthly EMI requested.
* **`AMT_GOODS_PRICE`**: Capital cost of goods for consumer finance applications.

### Group 3: Personal & Family Background (10 features)
* **`CODE_GENDER`**: Gender of the applicant (`M`, `F`, `XNA`).
* **`CNT_CHILDREN`**: Number of dependent children.
* **`CNT_FAM_MEMBERS`**: Total family members in the household.
* **`NAME_INCOME_TYPE`**: Employment category (*Working, Commercial Associate, Pensioner, State Servant, Student, Unemployed*).
* **`NAME_EDUCATION_TYPE`**: Educational attainment (*Higher education, Secondary / secondary special, Incomplete higher, Academic degree*).
* **`NAME_FAMILY_STATUS`**: Marital status (*Married, Single, Civil marriage, Separated, Widow*).
* **`NAME_HOUSING_TYPE`**: Residential tenure (*House/apartment, With parents, Rented apartment, Municipal apartment*).
* **`FLAG_OWN_CAR`**: Car ownership (`1` = Yes, `0` = No).
* **`FLAG_OWN_REALTY`**: Property/real estate ownership (`1` = Yes, `0` = No).
* **`OWN_CAR_AGE`**: Age of the applicant's vehicle in years.

### Group 4: Cash Flow & Employment Durations (5 features)
* **`AMT_INCOME_TOTAL`**: Total verified annual gross income.
* **`DAYS_BIRTH`**: Age in negative days relative to application date (e.g., `-10,950` days $\approx$ 30 years old).
* **`DAYS_EMPLOYED`**: Current employment tenure in negative days.
* **`DAYS_REGISTRATION`**: Number of days since the applicant updated their residential registration.
* **`DAYS_ID_PUBLISH`**: Number of days since primary identity document was officially issued/renewed.

### Group 5: Contact Verification Flags (6 features)
* **`FLAG_MOBIL`**, **`FLAG_EMP_PHONE`**, **`FLAG_WORK_PHONE`**, **`FLAG_CONT_MOBILE`**, **`FLAG_PHONE`**, **`FLAG_EMAIL`**:
  * Binary flags confirming whether applicant provided verified mobile, work phone, home phone, and email addresses.

### Group 6: Region, Rating & Address Mismatch Fraud Flags (11 features)
* **`REGION_POPULATION_RELATIVE`**: Normalized population density of the applicant's region.
* **`REGION_RATING_CLIENT` & `REGION_RATING_CLIENT_W_CITY`**: Regional credit risk tier assessed by bank (1 = prime, 3 = high risk).
* **`WEEKDAY_APPR_PROCESS_START` & `HOUR_APPR_PROCESS_START`**: Day and hour of the week the application was entered.
* **`REG_REGION_NOT_LIVE_REGION`**: Registered state differs from residence state.
* **`REG_REGION_NOT_WORK_REGION`**: Registered state differs from employer state.
* **`LIVE_REGION_NOT_WORK_REGION`**: Residence state differs from employer state.
* **`REG_CITY_NOT_LIVE_CITY`**: Registered city differs from living city (**Primary Address Mismatch Anti-Fraud Flag**).
* **`REG_CITY_NOT_WORK_CITY`**: Registered city differs from work city.
* **`LIVE_CITY_NOT_WORK_CITY`**: Living city differs from work city.

### Group 7: Employment Profile (2 features)
* **`OCCUPATION_TYPE`**: Specific vocation (*Laborers, Core staff, Drivers, Managers, Sales, IT, Medicine, Accountants*).
* **`ORGANIZATION_TYPE`**: Sector of the employer (*Self-employed, Government, Banking, Transport, Construction, School, Retail*).

### Group 8: External Credit Bureau Scores (3 features ⭐ *Top Predictors*)
* **`EXT_SOURCE_1`**: Credit rating from External Bureau 1 (scaled 0.0 to 1.0).
* **`EXT_SOURCE_2`**: Credit rating from External Bureau 2.
* **`EXT_SOURCE_3`**: Credit rating from External Bureau 3.
*(In the simulator UI, these are presented as CIBIL, Equifax, and Experian scores).*

### Group 9: Housing Quality & Building Architecture (47 features)
* Standardized building infrastructure indicators provided in 3 statistical aggregations: `_AVG` (Mean), `_MODE` (Mode), and `_MEDI` (Median).
* Features include: **`APARTMENTS`**, **`BASEMENTAREA`**, **`YEARS_BEGINEXPLUATATION`** (building age), **`YEARS_BUILD`**, **`COMMONAREA`**, **`ELEVATORS`**, **`ENTRANCES`**, **`FLOORSMAX`**, **`FLOORSMIN`**, **`LANDAREA`**, **`LIVINGAPARTMENTS`**, **`LIVINGAREA`**, **`NONLIVINGAPARTMENTS`**, **`NONLIVINGAREA`**.
* Plus qualitative property attributes:
  * **`FONDKAPREMONT_MODE`**: Building reserve fund governance.
  * **`HOUSETYPE_MODE`**: Property format (*Block of flats, Terraced house*).
  * **`TOTALAREA_MODE`**: Built-up square meters.
  * **`WALLSMATERIAL_MODE`**: Wall composition (*Stone/brick, Panel, Concrete, Wood*).
  * **`EMERGENCYSTATE_MODE`**: Whether building is declared structurally hazardous.

### Group 10: Social Circle Delinquency (4 features)
* **`OBS_30_CNT_SOCIAL_CIRCLE`**: Count of borrower's social/contact circle observed over 30 days.
* **`DEF_30_CNT_SOCIAL_CIRCLE`**: Count in social circle defaulting on loans by 30+ days.
* **`OBS_60_CNT_SOCIAL_CIRCLE`**: Count observed over 60 days.
* **`DEF_60_CNT_SOCIAL_CIRCLE`**: Count in social circle defaulting by 60+ days (*Neighborhood financial contagion proxy*).

### Group 11: Application Recency (1 feature)
* **`DAYS_LAST_PHONE_CHANGE`**: Days since applicant last replaced their mobile phone or SIM card prior to applying.

### Group 12: Identity Document Verification Flags (20 features)
* **`FLAG_DOCUMENT_2` through `FLAG_DOCUMENT_21`**:
  * Binary flags confirming verified submission of required KYC documents.
  * **`FLAG_DOCUMENT_3`**: Proof of Primary National ID (Aadhaar / National Identity card equivalent). Missing this causes severe risk penalties.

### Group 13: Credit Bureau Enquiries (6 features)
* Historical volume of bureau pull requests initiated by other institutions on this borrower:
  * **`AMT_REQ_CREDIT_BUREAU_HOUR`**: In the last 1 hour.
  * **`AMT_REQ_CREDIT_BUREAU_DAY`**: In the last 24 hours.
  * **`AMT_REQ_CREDIT_BUREAU_WEEK`**: In the last 7 days.
  * **`AMT_REQ_CREDIT_BUREAU_MON`**: In the last month.
  * **`AMT_REQ_CREDIT_BUREAU_QRT`**: In the last 3 months.
  * **`AMT_REQ_CREDIT_BUREAU_YEAR`**: In the last 12 months.
  *(A sudden surge in enquiries reflects desperate borrowing and multiple active rejections).*

---

## 🎯 Top 20 Distilled Features in the ML Model (`urban_model_features.json`)

The data pipeline compresses all 7 tables and 219 raw features into the **top 20 most predictive features** selected for real-time XGBoost inference and UI simulation:

| # | Feature Name | Source Table | Financial Signal |
|---|--------------|--------------|------------------|
| 1 | `EXT_SOURCE_MEAN` | Derived (`EXT_SOURCE_1,2,3`) | Average credit bureau score across all 3 external bureaus. |
| 2 | `EXT_SOURCE_MIN` | Derived (`EXT_SOURCE_1,2,3`) | Lowest credit score among external bureaus (captures single-bureau delinquency). |
| 3 | `EXT_SOURCE_1` | `application_train.csv` | Primary external bureau credit rating. |
| 4 | `CC_UTILISATION_RATIO`| `credit_card_balance.csv` | Credit card balance divided by total limit ($\text{Balance} / \text{Limit}$). |
| 5 | `CC_AVG_BALANCE` | `credit_card_balance.csv` | Average revolving debt carried on credit cards month-to-month. |
| 6 | `INSTAL_LATE_RATE` | `installments_payments.csv` | Percentage of past loan installments paid after the due date. |
| 7 | `PREV_REFUSAL_RATE` | `previous_application.csv` | Percentage of past loan applications to this bank that were rejected. |
| 8 | `PREV_APPROVED_COUNT` | `previous_application.csv` | Total count of historically approved loans (proves established credit history). |
| 9 | `CREDIT_TERM` | Derived (`AMT_CREDIT / AMT_ANNUITY`) | Requested loan repayment tenure in months. |
| 10 | `APARTMENTS_MEDI` | `application_train.csv` | Median residential building quality metric (property wealth proxy). |
| 11 | `DEF_60_CNT_SOCIAL_CIRCLE` | `application_train.csv` | Defaults within the applicant's immediate social circle / neighborhood. |
| 12 | `FLAG_DOCUMENT_3` | `application_train.csv` | Primary identity document verification flag (Aadhaar/National ID). |
| 13 | `FLAG_OWN_CAR` | `application_train.csv` | Vehicle ownership (movable collateral asset). |
| 14 | `REG_CITY_NOT_LIVE_CITY` | `application_train.csv` | Address mismatch flag (registered city $\neq$ living city). |
| 15 | `CODE_GENDER` | `application_train.csv` | Applicant gender. |
| 16 | `NAME_CONTRACT_TYPE` | `application_train.csv` | Cash loan vs. revolving loan. |
| 17 | `NAME_INCOME_TYPE_Working` | `application_train.csv` | Salaried corporate/private sector employment flag. |
| 18 | `NAME_INCOME_TYPE_Pensioner`| `application_train.csv` | Fixed retirement pension income flag. |
| 19 | `NAME_EDUCATION_TYPE_Higher education` | `application_train.csv` | University / college degree holder flag. |
| 20 | `NAME_EDUCATION_TYPE_Secondary / secondary special` | `application_train.csv` | High school / vocational certificate flag. |
