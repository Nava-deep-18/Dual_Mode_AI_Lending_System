from sqlalchemy import Column, Integer, String, Float, DateTime, Date, ForeignKey, UniqueConstraint
import datetime
from database import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    loans = relationship("LoanRecord", back_populates="owner")

class LoanRecord(Base):
    __tablename__ = "loan_history"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Audit Trace
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="loans")
    borrower_name = Column(String, default="Anonymous")
    
    # "Rural Microfinance" or "Urban Commercial Bank"
    loan_module = Column(String, index=True)
    
    # Store the massive JSON form they submitted as a string so we can review it later
    raw_input_data = Column(String)
    
    # The output from the AI
    risk_score = Column(Float)
    risk_tier = Column(String)
    decision = Column(String)
    suggested_interest_rate = Column(Float, nullable=True)
    max_loan_limit = Column(Float, nullable=True)

    # --- Promoted Rural fields (now top-level columns for easy querying) ---
    # These are only populated for Rural Microfinance loans
    loan_amount = Column(Float, nullable=True)
    loan_tenure_months = Column(Integer, nullable=True)
    # effective_rate = lender_interest_rate if provided, else AI suggested_interest_rate
    effective_rate = Column(Float, nullable=True)

    # Relationship to the repayment schedule (only exists after activation)
    repayment_schedule = relationship("RepaymentSchedule", back_populates="loan_record", uselist=False)


class RepaymentSchedule(Base):
    """
    Created when a Rural loan is manually 'activated' by the officer.
    One-to-one with LoanRecord. Auto-generates MonthlyPayment rows.
    """
    __tablename__ = "repayment_schedules"

    id = Column(Integer, primary_key=True, index=True)
    loan_record_id = Column(Integer, ForeignKey("loan_history.id"), unique=True, nullable=False)
    
    # Loan terms at time of activation (snapshot)
    principal = Column(Float, nullable=False)
    annual_rate = Column(Float, nullable=False)    # % e.g. 15.0
    tenure_months = Column(Integer, nullable=False)
    monthly_emi = Column(Float, nullable=False)    # pre-calculated
    
    start_date = Column(Date, nullable=False)      # first EMI due date basis
    activated_at = Column(DateTime, default=datetime.datetime.utcnow)

    loan_record = relationship("LoanRecord", back_populates="repayment_schedule")
    payments = relationship("MonthlyPayment", back_populates="schedule", order_by="MonthlyPayment.month_number")


class MonthlyPayment(Base):
    """
    One row per month in the repayment schedule.
    Status is auto-computed: PENDING → PAID / PARTIAL / MISSED.
    """
    __tablename__ = "monthly_payments"

    id = Column(Integer, primary_key=True, index=True)
    schedule_id = Column(Integer, ForeignKey("repayment_schedules.id"), nullable=False)
    
    month_number = Column(Integer, nullable=False)   # 1-indexed
    due_date = Column(Date, nullable=False)
    due_amount = Column(Float, nullable=False)        # = monthly_emi
    
    paid_amount = Column(Float, nullable=True, default=0.0)
    paid_date = Column(Date, nullable=True)
    # PENDING | PAID | PARTIAL | MISSED
    status = Column(String, default="PENDING")

    schedule = relationship("RepaymentSchedule", back_populates="payments")

    __table_args__ = (
        UniqueConstraint("schedule_id", "month_number", name="uq_schedule_month"),
    )
