from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from db.base_class import Base

class KYCAuditLog(Base):
    __tablename__ = "kyc_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    kyc_id = Column(Integer, ForeignKey("kyc.id"), index=True, nullable=False)
    action = Column(String, nullable=False)
    old_status = Column(String, nullable=True)
    new_status = Column(String, nullable=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    kyc = relationship("KYC", back_populates="audit_logs", foreign_keys=[kyc_id])
    admin = relationship("Admin", foreign_keys=[admin_id])
