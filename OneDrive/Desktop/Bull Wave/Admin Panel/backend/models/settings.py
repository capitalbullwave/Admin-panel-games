from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db.base_class import Base

class Setting(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(50), index=True, nullable=False)
    setting_key = Column(String(100), unique=True, index=True, nullable=False)
    setting_value = Column(Text, nullable=True)
    description = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    updated_by = Column(Integer, ForeignKey("user.id"), nullable=True)  # Admin who updated

    # Relationships
    updater = relationship("User", foreign_keys=[updated_by])
    audit_logs = relationship("SettingsAuditLog", back_populates="setting", cascade="all, delete-orphan")


class SettingsAuditLog(Base):
    __tablename__ = "settings_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    setting_id = Column(Integer, ForeignKey("settings.id"), nullable=False)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    changed_by = Column(Integer, ForeignKey("user.id"), nullable=False)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    setting = relationship("Setting", back_populates="audit_logs")
    changer = relationship("User", foreign_keys=[changed_by])
