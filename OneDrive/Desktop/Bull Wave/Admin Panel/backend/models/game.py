from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from db.base_class import Base

class Game(Base):
    __tablename__ = "game"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False)
    entry_fee = Column(Float, nullable=False)
    min_players = Column(Integer, default=2)
    max_players = Column(Integer, default=2)
    status = Column(String, default="Active") # Active, Disabled
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    results = relationship("Result", back_populates="game")
