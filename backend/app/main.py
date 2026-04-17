from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from schemas import (
    RuralHumanInput, UrbanBureauInput, PredictionResponse,
    ActivateLoanRequest, PaymentLogRequest, RepaymentScheduleResponse
)
from ml_service import ml_engine
from database import engine, get_db, Base
from models import LoanRecord, User, RepaymentSchedule, MonthlyPayment
from sqlalchemy.orm import Session
import auth
import json
import math
import datetime

# Auto-generate the SQLite tables if they do not exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Dual-Mode AI Lending System",
    description="FastAPI Backend serving human-readable SHAP explanations.",
    version="3.0.0"
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


# --- EMI CALCULATOR ---
def calculate_emi(principal: float, annual_rate: float, tenure_months: int) -> float:
    """Standard reducing-balance EMI formula: P*r*(1+r)^n / ((1+r)^n - 1)"""
    if annual_rate == 0:
        return round(principal / tenure_months, 2)
    r = annual_rate / 12 / 100
    emi = principal * r * (1 + r) ** tenure_months / ((1 + r) ** tenure_months - 1)
    return round(emi, 2)


def log_to_database(
    db: Session,
    module_name: str,
    raw_input: str,
    result: dict,
    owner_id: int,
    borrower_name: str,
    loan_amount: float = None,
    loan_tenure_months: int = None,
    effective_rate: float = None
):
    """Helper to write a loan evaluation record to SQLite, with promoted Rural fields."""
    record = LoanRecord(
        owner_id=owner_id,
        borrower_name=borrower_name,
        loan_module=module_name,
        raw_input_data=raw_input,
        risk_score=result["risk_score"],
        risk_tier=result["risk_tier"],
        decision=result["decision"],
        suggested_interest_rate=result.get("suggested_interest_rate"),
        max_loan_limit=result.get("max_loan_limit"),
        # Promoted Rural fields (None for Urban)
        loan_amount=loan_amount,
        loan_tenure_months=loan_tenure_months,
        effective_rate=effective_rate,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@app.post("/api/predict/rural", response_model=PredictionResponse)
def predict_rural_risk(
    request: RuralHumanInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_user)
):
    """
    Submits raw application data for a Rural Microfinance applicant.
    Automatically engineers the 15 hidden features (like DTI & One-Hot columns),
    scores via XGBoost, and generates human-readable SHAP sentences.
    """
    try:
        result = ml_engine.predict_rural(request)

        # Determine the effective rate: lender entry first, AI suggestion as fallback
        effective_rate = request.lender_interest_rate or result.get("suggested_interest_rate")

        log_to_database(
            db,
            module_name="Rural Microfinance",
            raw_input=request.model_dump_json(by_alias=True),
            result=result,
            owner_id=current_user.id,
            borrower_name=request.borrower_name,
            loan_amount=request.loan_amount,
            loan_tenure_months=request.loan_tenure_months,
            effective_rate=effective_rate,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/predict/urban", response_model=PredictionResponse)
def predict_urban_risk(
    request: UrbanBureauInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_user)
):
    """
    Evaluates an Urban Commercial Base applicant using Bureau aggregate data.
    """
    try:
        result = ml_engine.predict_urban(request)
        # Urban has no loan amount/tenure/rate fields
        log_to_database(
            db,
            module_name="Urban Commercial Bank",
            raw_input=request.model_dump_json(by_alias=True),
            result=result,
            owner_id=current_user.id,
            borrower_name=request.borrower_name,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/history")
def get_prediction_history(
    db: Session = Depends(get_db),
    limit: int = 50,
    current_user: User = Depends(auth.get_current_user)
):
    """
    Retrieves the last 50 loan evaluations scoped to the logged-in user.
    Includes is_activated flag so the frontend knows if a schedule exists.
    """
    records = (
        db.query(LoanRecord)
        .filter(LoanRecord.owner_id == current_user.id)
        .order_by(LoanRecord.created_at.desc())
        .limit(limit)
        .all()
    )
    result = []
    for r in records:
        result.append({
            "id": r.id,
            "created_at": r.created_at.isoformat(),
            "borrower_name": r.borrower_name,
            "loan_module": r.loan_module,
            "risk_score": r.risk_score,
            "risk_tier": r.risk_tier,
            "decision": r.decision,
            "suggested_interest_rate": r.suggested_interest_rate,
            "max_loan_limit": r.max_loan_limit,
            "raw_input_data": r.raw_input_data,
            # Rural promoted fields
            "loan_amount": r.loan_amount,
            "loan_tenure_months": r.loan_tenure_months,
            "effective_rate": r.effective_rate,
            # Is this rural loan already activated for repayment tracking?
            "is_activated": r.repayment_schedule is not None,
        })
    return result


# ─────────────────────────────────────────────────────────
#  REPAYMENT TRACKER ENDPOINTS (Rural only)
# ─────────────────────────────────────────────────────────

@app.post("/api/loans/{loan_id}/activate")
def activate_loan(
    loan_id: int,
    body: ActivateLoanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_user)
):
    """
    Activates a Rural approved loan for repayment tracking.
    Generates the full monthly payment schedule automatically.
    """
    loan = db.query(LoanRecord).filter(
        LoanRecord.id == loan_id,
        LoanRecord.owner_id == current_user.id
    ).first()

    if not loan:
        raise HTTPException(status_code=404, detail="Loan record not found")
    if loan.loan_module != "Rural Microfinance":
        raise HTTPException(status_code=400, detail="Repayment tracking is only for Rural Microfinance loans")
    if "Approved" not in loan.decision:
        raise HTTPException(status_code=400, detail="Only approved loans can be activated")
    if loan.repayment_schedule:
        raise HTTPException(status_code=400, detail="This loan is already activated")
    if not loan.loan_amount or not loan.loan_tenure_months or not loan.effective_rate:
        raise HTTPException(status_code=400, detail="Loan amount, tenure, or rate missing — cannot generate schedule")

    # Use the officer's chosen disbursed amount; fall back to requested amount
    principal = body.disbursed_amount if body.disbursed_amount else loan.loan_amount

    # Calculate EMI on the actual disbursed principal
    emi = calculate_emi(principal, loan.effective_rate, loan.loan_tenure_months)

    # Create the schedule
    schedule = RepaymentSchedule(
        loan_record_id=loan.id,
        principal=principal,
        annual_rate=loan.effective_rate,
        tenure_months=loan.loan_tenure_months,
        monthly_emi=emi,
        start_date=body.start_date,
    )
    db.add(schedule)
    db.flush()  # Get schedule.id without committing

    # Auto-generate MonthlyPayment rows
    today = datetime.date.today()
    for month in range(1, loan.loan_tenure_months + 1):
        # Due date = start_date + (month) months
        due_year = body.start_date.year + (body.start_date.month + month - 1) // 12
        due_month = (body.start_date.month + month - 1) % 12 + 1
        due_day = min(body.start_date.day, 28)  # Cap at 28 to handle Feb safely
        due_date = datetime.date(due_year, due_month, due_day)

        # Auto-mark past months as MISSED if they are already overdue
        status = "PENDING"
        if due_date < today:
            status = "MISSED"

        payment = MonthlyPayment(
            schedule_id=schedule.id,
            month_number=month,
            due_date=due_date,
            due_amount=emi,
            paid_amount=0.0,
            status=status,
        )
        db.add(payment)

    db.commit()
    db.refresh(schedule)
    return {"message": "Loan activated successfully", "schedule_id": schedule.id, "monthly_emi": emi}


@app.get("/api/loans/{loan_id}/schedule", response_model=RepaymentScheduleResponse)
def get_repayment_schedule(
    loan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_user)
):
    """
    Returns the full repayment schedule + all monthly payment statuses for a loan.
    """
    loan = db.query(LoanRecord).filter(
        LoanRecord.id == loan_id,
        LoanRecord.owner_id == current_user.id
    ).first()

    if not loan:
        raise HTTPException(status_code=404, detail="Loan record not found")
    if not loan.repayment_schedule:
        raise HTTPException(status_code=404, detail="This loan has not been activated yet")

    schedule = loan.repayment_schedule
    return RepaymentScheduleResponse(
        id=schedule.id,
        loan_record_id=loan.id,
        borrower_name=loan.borrower_name,
        principal=schedule.principal,
        annual_rate=schedule.annual_rate,
        tenure_months=schedule.tenure_months,
        monthly_emi=schedule.monthly_emi,
        start_date=schedule.start_date,
        activated_at=schedule.activated_at,
        payments=[
            {
                "id": p.id,
                "month_number": p.month_number,
                "due_date": p.due_date,
                "due_amount": p.due_amount,
                "paid_amount": p.paid_amount,
                "paid_date": p.paid_date,
                "status": p.status,
            }
            for p in schedule.payments
        ]
    )


@app.patch("/api/loans/{loan_id}/payments/{month_number}")
def log_payment(
    loan_id: int,
    month_number: int,
    body: PaymentLogRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_user)
):
    """
    Logs the actual payment received for a specific month.
    Auto-computes status: PAID / PARTIAL / MISSED.
    """
    loan = db.query(LoanRecord).filter(
        LoanRecord.id == loan_id,
        LoanRecord.owner_id == current_user.id
    ).first()

    if not loan or not loan.repayment_schedule:
        raise HTTPException(status_code=404, detail="Loan or schedule not found")

    payment = db.query(MonthlyPayment).filter(
        MonthlyPayment.schedule_id == loan.repayment_schedule.id,
        MonthlyPayment.month_number == month_number
    ).first()

    if not payment:
        raise HTTPException(status_code=404, detail=f"Month {month_number} not found in schedule")

    payment.paid_amount = body.paid_amount
    payment.paid_date = body.paid_date

    # Auto-compute status
    tolerance = 1.0  # ₹1 tolerance for rounding
    if body.paid_amount >= (payment.due_amount - tolerance):
        payment.status = "PAID"
    elif body.paid_amount > 0:
        payment.status = "PARTIAL"
    else:
        payment.status = "MISSED"

    db.commit()
    db.refresh(payment)
    return {
        "message": f"Month {month_number} updated",
        "status": payment.status,
        "paid_amount": payment.paid_amount,
        "due_amount": payment.due_amount,
    }


@app.get("/api/schedule/calendar")
def get_collection_calendar(
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_user)
):
    """
    Returns all MonthlyPayment instances across all activated loans owned by the current user.
    Used for the global EMI Collection Calendar.
    """
    payments = (
        db.query(MonthlyPayment, LoanRecord.borrower_name, LoanRecord.id.label('loan_id'))
        .join(RepaymentSchedule, MonthlyPayment.schedule_id == RepaymentSchedule.id)
        .join(LoanRecord, RepaymentSchedule.loan_record_id == LoanRecord.id)
        .filter(LoanRecord.owner_id == current_user.id)
        .order_by(MonthlyPayment.due_date.asc())
        .all()
    )

    result = []
    for payment, borrower_name, loan_id in payments:
        result.append({
            "id": payment.id,
            "loan_id": loan_id,
            "borrower_name": borrower_name,
            "month_number": payment.month_number,
            "due_date": payment.due_date.isoformat(),
            "due_amount": payment.due_amount,
            "paid_amount": payment.paid_amount,
            "status": payment.status
        })
    
    return result
