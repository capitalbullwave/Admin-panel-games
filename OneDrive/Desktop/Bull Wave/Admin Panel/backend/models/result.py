from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from db.base_class import Base

class Result(Base):
    __tablename__ = "result"
    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("games.id"), index=True, nullable=False)
    winner_id = Column(Integer, ForeignKey("user.id"), index=True, nullable=False)
    prize_amount = Column(Float, nullable=False)
    settlement_status = Column(String, default="Pending") # Pending, Completed
    declared_at = Column(DateTime(timezone=True), server_default=func.now())

    game = relationship("Game", back_populates="results")
    winner = relationship("User", back_populates="results")
