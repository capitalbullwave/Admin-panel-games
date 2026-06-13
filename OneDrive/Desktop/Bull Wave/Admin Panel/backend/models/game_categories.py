from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from db.base_class import Base

class GameCategory(Base):
    __tablename__ = "game_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True, index=True)
    slug = Column(String(100), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    
    icon = Column(String(255), nullable=True)
    thumbnail_url = Column(String(255), nullable=True)
    banner_url = Column(String(255), nullable=True)
    color_code = Column(String(50), nullable=True)
    
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    
    seo_title = Column(String(255), nullable=True)
    seo_description = Column(Text, nullable=True)
    
    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    games = relationship("Game", back_populates="category")

