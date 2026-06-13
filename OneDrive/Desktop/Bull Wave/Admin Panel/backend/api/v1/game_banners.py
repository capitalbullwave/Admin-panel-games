from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from api import deps
from crud.crud_game_banners import game_banner as crud_game_banner
from schemas.game_banners import GameBanner, GameBannerCreate, GameBannerUpdate

router = APIRouter()

@router.get("/", response_model=List[GameBanner])
async def read_game_banners(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return await crud_game_banner.get_multi(db, skip=skip, limit=limit)

@router.post("/", response_model=GameBanner)
async def create_game_banner(
    *,
    db: AsyncSession = Depends(deps.get_db),
    banner_in: GameBannerCreate,
) -> Any:
    return await crud_game_banner.create(db=db, obj_in=banner_in)

@router.put("/{id}", response_model=GameBanner)
async def update_game_banner(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    banner_in: GameBannerUpdate,
) -> Any:
    banner = await crud_game_banner.get(db=db, id=id)
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    return await crud_game_banner.update(db=db, db_obj=banner, obj_in=banner_in)

@router.delete("/{id}", response_model=GameBanner)
async def delete_game_banner(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
) -> Any:
    banner = await crud_game_banner.get(db=db, id=id)
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    return await crud_game_banner.remove(db=db, id=id)
