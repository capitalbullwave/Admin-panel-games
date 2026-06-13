from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from crud.base import CRUDBase
from models.game_settings import GameSetting
from schemas.game_settings import GameSettingCreate, GameSettingUpdate

class CRUDGameSetting(CRUDBase[GameSetting, GameSettingCreate, GameSettingUpdate]):
    async def get_settings(self, db: AsyncSession) -> GameSetting:
        result = await db.execute(select(self.model).limit(1))
        settings = result.scalars().first()
        if not settings:
            settings = await self.create(db, obj_in=GameSettingCreate())
        return settings

game_setting = CRUDGameSetting(GameSetting)
