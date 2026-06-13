from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ResultBase(BaseModel):
    game_id: int
    winner_id: int
    prize_amount: float
    settlement_status: Optional[str] = "Pending"

class ResultCreate(ResultBase):
    pass

class ResultUpdate(BaseModel):
    settlement_status: Optional[str] = None

class ResultInDBBase(ResultBase):
    id: int
    declared_at: datetime

    class Config:
        from_attributes = True

class Result(ResultInDBBase):
    pass
