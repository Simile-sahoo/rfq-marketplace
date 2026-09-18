from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String)

class RFQ(Base):
    __tablename__ = "rfqs"
    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String)
    description = Column(String)
    quantity = Column(Integer)
    delivery_location = Column(String)
    deadline = Column(String)
    buyer_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    buyer = relationship("User")

class Quote(Base):
    __tablename__ = "quotes"
    id = Column(Integer, primary_key=True, index=True)
    rfq_id = Column(Integer, ForeignKey("rfqs.id"))
    supplier_id = Column(Integer, ForeignKey("users.id"))
    price = Column(Float)
    delivery_days = Column(Integer)
    notes = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)