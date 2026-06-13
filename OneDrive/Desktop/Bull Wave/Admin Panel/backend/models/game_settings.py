from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from sqlalchemy.sql import func
from db.base_class import Base

class GameSetting(Base):
    __tablename__ = "game_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    maintenance_mode = Column(Boolean, default=False)
    default_currency = Column(String(10), default="USD")
    min_deposit = Column(Float, default=10.0)
    max_deposit = Column(Float, default=10000.0)
    default_commission = Column(Float, default=5.0)
    default_rtp = Column(Float, default=95.0)
    allowed_countries = Column(Text, nullable=True)
    
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
