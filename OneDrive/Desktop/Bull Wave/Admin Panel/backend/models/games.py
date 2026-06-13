from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Float, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from db.base_class import Base

class Game(Base):
    __tablename__ = "games"
    
    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("game_categories.id", ondelete="CASCADE"), nullable=False)
    provider_id = Column(Integer, ForeignKey("game_providers.id", ondelete="CASCADE"), nullable=True)
    
    name = Column(String(150), nullable=False, index=True)
    slug = Column(String(150), nullable=False, unique=True, index=True)
    short_description = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    
    thumbnail = Column(String(255), nullable=True)
    banner_image = Column(String(255), nullable=True)
    game_url = Column(String(255), nullable=True)
    
    min_bet = Column(Float, default=0.0)
    max_bet = Column(Float, default=0.0)
    
    is_featured = Column(Boolean, default=False)
    is_popular = Column(Boolean, default=False)
    is_trending = Column(Boolean, default=False)
    
    sort_order = Column(Integer, default=0)
    status = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    category = relationship("GameCategory", back_populates="games")
    provider = relationship("GameProvider", back_populates="games")
    results = relationship("Result", back_populates="game")
