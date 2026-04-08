from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
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
    
    # "Rural" or "Urban"
    loan_module = Column(String, index=True)
    
    # Store the massive JSON form they submitted as a string so we can review it later
    raw_input_data = Column(String)
    
    # The output from the AI
    risk_score = Column(Float)
    risk_tier = Column(String)
    decision = Column(String)
    suggested_interest_rate = Column(Float, nullable=True)
    max_loan_limit = Column(Float, nullable=True)
