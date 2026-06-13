from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from api import deps
from crud.crud_games import game as crud_game
from schemas.games import Game, GameCreate, GameUpdate
router = APIRouter()

from sqlalchemy.orm import selectinload
from sqlalchemy import select

@router.get("/", response_model=List[Game])
async def read_games(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    query = select(crud_game.model).options(
        selectinload(crud_game.model.category),
        selectinload(crud_game.model.provider)
    ).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/", response_model=Game)
async def create_game(
    *,
    db: AsyncSession = Depends(deps.get_db),
    game_in: GameCreate,
) -> Any:
    try:
        new_game = await crud_game.create(db=db, obj_in=game_in)
        query = select(crud_game.model).options(
            selectinload(crud_game.model.category),
            selectinload(crud_game.model.provider)
        ).where(crud_game.model.id == new_game.id)
        result = await db.execute(query)
        return result.scalars().first()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="A game with this slug already exists.")

@router.put("/{id}", response_model=Game)
async def update_game(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    game_in: GameUpdate,
) -> Any:
    game_obj = await crud_game.get(db=db, id=id)
    if not game_obj:
        raise HTTPException(status_code=404, detail="Game not found")
    try:
        updated_game = await crud_game.update(db=db, db_obj=game_obj, obj_in=game_in)
        query = select(crud_game.model).options(
            selectinload(crud_game.model.category),
            selectinload(crud_game.model.provider)
        ).where(crud_game.model.id == updated_game.id)
        result = await db.execute(query)
        return result.scalars().first()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="A game with this slug already exists.")

@router.delete("/{id}")
async def delete_game(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
) -> Any:
    query = select(crud_game.model).options(
        selectinload(crud_game.model.category),
        selectinload(crud_game.model.provider)
    ).where(crud_game.model.id == id)
    result = await db.execute(query)
    game_obj = result.scalars().first()
    if not game_obj:
        raise HTTPException(status_code=404, detail="Game not found")
    try:
        await crud_game.remove(db=db, id=id)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Cannot delete this game because it is associated with other records.")
    return {"success": True, "message": "Game deleted successfully"}
