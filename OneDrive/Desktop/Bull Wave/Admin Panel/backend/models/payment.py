from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from db.base_class import Base

class PaymentGateway(Base):
    __tablename__ = "payment_gateway"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    provider = Column(String, nullable=False) # Razorpay, Stripe, PayU, etc.
    api_key = Column(String, nullable=True)
    secret_key = Column(String, nullable=True)
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class WebhookLog(Base):
    __tablename__ = "webhook_log"
    id = Column(Integer, primary_key=True, index=True)
    gateway_name = Column(String, nullable=False)
    event_type = Column(String, nullable=True)
    payload = Column(Text, nullable=True)
    processed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
