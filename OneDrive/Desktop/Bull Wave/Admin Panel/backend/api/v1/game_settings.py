from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from api import deps
from crud.crud_game_settings import game_setting as crud_game_setting
from schemas.game_settings import GameSetting, GameSettingUpdate

router = APIRouter()

@router.get("/", response_model=GameSetting)
async def read_game_settings(
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    return await crud_game_setting.get_settings(db)

@router.put("/", response_model=GameSetting)
async def update_game_settings(
    *,
    db: AsyncSession = Depends(deps.get_db),
    settings_in: GameSettingUpdate,
) -> Any:
    settings = await crud_game_setting.get_settings(db)
    return await crud_game_setting.update(db=db, db_obj=settings, obj_in=settings_in)
