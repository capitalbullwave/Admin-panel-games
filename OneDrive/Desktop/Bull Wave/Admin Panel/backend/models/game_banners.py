from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from db.base_class import Base

class GameBanner(Base):
    __tablename__ = "game_banners"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    image = Column(String(255), nullable=False)
    redirect_url = Column(String(255), nullable=True)
    display_order = Column(Integer, default=0)
    status = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
