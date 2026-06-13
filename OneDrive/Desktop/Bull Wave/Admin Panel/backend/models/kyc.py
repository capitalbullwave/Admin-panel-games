from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from db.base_class import Base

class KYC(Base):
    __tablename__ = "kyc"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), unique=True, index=True, nullable=False)
    pan_number = Column(String, unique=True, index=True, nullable=True)
    pan_holder_name = Column(String, nullable=True)
    pan_image_url = Column(String, nullable=True)
    bank_account_name = Column(String, nullable=True)
    bank_account_number = Column(String, nullable=True)
    ifsc_code = Column(String, nullable=True)
    bank_document_url = Column(String, nullable=True)
    status = Column(String, default="pending") # pending, approved, rejected, under_review
    rejection_reason = Column(Text, nullable=True)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True) # Admin ID

    user = relationship("User", back_populates="kyc")
    reviewer = relationship("Admin", foreign_keys=[reviewed_by])
    audit_logs = relationship("KYCAuditLog", back_populates="kyc", cascade="all, delete-orphan")
