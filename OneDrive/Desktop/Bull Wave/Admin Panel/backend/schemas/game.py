from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class GameBase(BaseModel):
    name: str
    category: str
    entry_fee: float
    min_players: Optional[int] = 2
    max_players: Optional[int] = 2
    status: Optional[str] = "Active"

class GameCreate(GameBase):
    pass

class GameUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    entry_fee: Optional[float] = None
    min_players: Optional[int] = None
    max_players: Optional[int] = None
    status: Optional[str] = None

class GameInDBBase(GameBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Game(GameInDBBase):
    pass
