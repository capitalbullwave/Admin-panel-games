from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class GameSettingBase(BaseModel):
    maintenance_mode: Optional[bool] = False
    default_currency: Optional[str] = "USD"
    min_deposit: Optional[float] = 10.0
    max_deposit: Optional[float] = 10000.0
    default_commission: Optional[float] = 5.0
    default_rtp: Optional[float] = 95.0
    allowed_countries: Optional[str] = None

class GameSettingCreate(GameSettingBase):
    pass

class GameSettingUpdate(BaseModel):
    maintenance_mode: Optional[bool] = None
    default_currency: Optional[str] = None
    min_deposit: Optional[float] = None
    max_deposit: Optional[float] = None
    default_commission: Optional[float] = None
    default_rtp: Optional[float] = None
    allowed_countries: Optional[str] = None

class GameSettingInDBBase(GameSettingBase):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True

class GameSetting(GameSettingInDBBase):
    pass
