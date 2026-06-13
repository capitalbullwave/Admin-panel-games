from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class GameBannerBase(BaseModel):
    title: str
    image: str
    redirect_url: Optional[str] = None
    display_order: Optional[int] = 0
    status: Optional[bool] = True

class GameBannerCreate(GameBannerBase):
    pass

class GameBannerUpdate(BaseModel):
    title: Optional[str] = None
    image: Optional[str] = None
    redirect_url: Optional[str] = None
    display_order: Optional[int] = None
    status: Optional[bool] = None

class GameBannerInDBBase(GameBannerBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class GameBanner(GameBannerInDBBase):
    pass
