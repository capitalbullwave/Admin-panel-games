from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class GameCategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None
    thumbnail_url: Optional[str] = None
    banner_url: Optional[str] = None
    color_code: Optional[str] = None
    display_order: Optional[int] = 0
    is_active: Optional[bool] = True
    is_featured: Optional[bool] = False
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

class GameCategoryCreate(GameCategoryBase):
    pass

class GameCategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    thumbnail_url: Optional[str] = None
    banner_url: Optional[str] = None
    color_code: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

class GameCategoryInDBBase(GameCategoryBase):
    id: int
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    total_games: Optional[int] = 0

    class Config:
        from_attributes = True

class GameCategory(GameCategoryInDBBase):
    pass
