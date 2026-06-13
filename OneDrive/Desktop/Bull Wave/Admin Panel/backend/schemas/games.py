from typing import Optional
from pydantic import BaseModel
from datetime import datetime
from schemas.game_categories import GameCategory
from schemas.game_providers import GameProvider

class GameBase(BaseModel):
    category_id: int
    provider_id: Optional[int] = None
    name: str
    slug: str
    short_description: Optional[str] = None
    description: Optional[str] = None
    thumbnail: Optional[str] = None
    banner_image: Optional[str] = None
    game_url: Optional[str] = None
    min_bet: Optional[float] = 0.0
    max_bet: Optional[float] = 0.0
    is_featured: Optional[bool] = False
    is_popular: Optional[bool] = False
    is_trending: Optional[bool] = False
    sort_order: Optional[int] = 0
    status: Optional[bool] = True

class GameCreate(GameBase):
    pass

class GameUpdate(BaseModel):
    category_id: Optional[int] = None
    provider_id: Optional[int] = None
    name: Optional[str] = None
    slug: Optional[str] = None
    short_description: Optional[str] = None
    description: Optional[str] = None
    thumbnail: Optional[str] = None
    banner_image: Optional[str] = None
    game_url: Optional[str] = None
    min_bet: Optional[float] = None
    max_bet: Optional[float] = None
    is_featured: Optional[bool] = None
    is_popular: Optional[bool] = None
    is_trending: Optional[bool] = None
    sort_order: Optional[int] = None
    status: Optional[bool] = None

class GameInDBBase(GameBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Game(GameInDBBase):
    category: Optional[GameCategory] = None
    provider: Optional[GameProvider] = None
