from sqlalchemy import Column, Integer, String, Float, DateTime
import datetime
from database import Base

class LoanRecord(Base):
    __tablename__ = "loan_history"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # "Rural" or "Urban"
    loan_module = Column(String, index=True)
    
    # Store the massive JSON form they submitted as a string so we can review it later
    raw_input_data = Column(String)
    
    # The output from the AI
    risk_score = Column(Float)
    risk_tier = Column(String)
    decision = Column(String)
