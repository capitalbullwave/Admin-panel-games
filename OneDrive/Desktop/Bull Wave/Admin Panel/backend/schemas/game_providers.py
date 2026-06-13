from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class GameProviderBase(BaseModel):
    name: str
    logo: Optional[str] = None
    description: Optional[str] = None
    status: Optional[bool] = True

class GameProviderCreate(GameProviderBase):
    pass

class GameProviderUpdate(BaseModel):
    name: Optional[str] = None
    logo: Optional[str] = None
    description: Optional[str] = None
    status: Optional[bool] = None

class GameProviderInDBBase(GameProviderBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class GameProvider(GameProviderInDBBase):
    pass
