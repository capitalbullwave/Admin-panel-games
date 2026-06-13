from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from api import deps
from crud.crud_game_providers import game_provider as crud_game_provider
from schemas.game_providers import GameProvider, GameProviderCreate, GameProviderUpdate

router = APIRouter()

@router.get("/", response_model=List[GameProvider])
async def read_game_providers(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return await crud_game_provider.get_multi(db, skip=skip, limit=limit)

@router.post("/", response_model=GameProvider)
async def create_game_provider(
    *,
    db: AsyncSession = Depends(deps.get_db),
    provider_in: GameProviderCreate,
) -> Any:
    try:
        return await crud_game_provider.create(db=db, obj_in=provider_in)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="A provider with this name already exists.")

@router.put("/{id}", response_model=GameProvider)
async def update_game_provider(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    provider_in: GameProviderUpdate,
) -> Any:
    provider = await crud_game_provider.get(db=db, id=id)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    try:
        return await crud_game_provider.update(db=db, db_obj=provider, obj_in=provider_in)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="A provider with this name already exists.")

@router.delete("/{id}")
async def delete_game_provider(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
) -> Any:
    provider = await crud_game_provider.get(db=db, id=id)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    try:
        await crud_game_provider.remove(db=db, id=id)
        return {"success": True, "message": "Provider deleted successfully"}
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Cannot delete this provider because it is associated with games.")
