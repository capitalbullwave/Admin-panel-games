from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.exc import IntegrityError
from api import deps
from crud.crud_game_categories import game_category as crud_game_category
from models.games import Game
from models.game_categories import GameCategory as GameCategoryModel
from schemas.game_categories import GameCategory, GameCategoryCreate, GameCategoryUpdate

router = APIRouter()

@router.get("/dropdown", response_model=List[dict])
async def get_dropdown_categories(
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    # Just return id and name for active categories
    result = await db.execute(
        select(GameCategoryModel.id, GameCategoryModel.name)
        .where(GameCategoryModel.is_active == True)
        .order_by(GameCategoryModel.display_order.asc())
    )
    categories = result.all()
    return [{"id": c.id, "name": c.name} for c in categories]

@router.get("/search", response_model=List[GameCategory])
async def search_game_categories(
    q: str,
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    query = (
        select(GameCategoryModel, func.count(Game.id).label("total_games_count"))
        .outerjoin(Game, GameCategoryModel.id == Game.category_id)
        .where(
            or_(
                GameCategoryModel.name.ilike(f"%{q}%"),
                GameCategoryModel.slug.ilike(f"%{q}%")
            )
        )
        .group_by(GameCategoryModel.id)
        .offset(skip).limit(limit)
    )
    result = await db.execute(query)
    categories = []
    for cat, total in result.all():
        cat.total_games = total
        categories.append(cat)
    return categories

@router.get("/{id}", response_model=GameCategory)
async def get_category(
    id: int,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    query = (
        select(GameCategoryModel, func.count(Game.id).label("total_games_count"))
        .outerjoin(Game, GameCategoryModel.id == Game.category_id)
        .where(GameCategoryModel.id == id)
        .group_by(GameCategoryModel.id)
    )
    result = await db.execute(query)
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Category not found")
    cat, total = row
    cat.total_games = total
    return cat

@router.get("/", response_model=List[GameCategory])
async def read_game_categories(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    query = (
        select(GameCategoryModel, func.count(Game.id).label("total_games_count"))
        .outerjoin(Game, GameCategoryModel.id == Game.category_id)
        .group_by(GameCategoryModel.id)
        .order_by(GameCategoryModel.display_order.asc())
        .offset(skip).limit(limit)
    )
    result = await db.execute(query)
    categories = []
    for cat, total in result.all():
        cat.total_games = total
        categories.append(cat)
    return categories

@router.post("/", response_model=GameCategory)
async def create_game_category(
    *,
    db: AsyncSession = Depends(deps.get_db),
    category_in: GameCategoryCreate,
) -> Any:
    try:
        return await crud_game_category.create(db=db, obj_in=category_in)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=400,
            detail="A category with this name or slug already exists."
        )

@router.put("/{id}", response_model=GameCategory)
async def update_game_category(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    category_in: GameCategoryUpdate,
) -> Any:
    category = await crud_game_category.get(db=db, id=id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    try:
        return await crud_game_category.update(db=db, db_obj=category, obj_in=category_in)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=400,
            detail="A category with this name or slug already exists."
        )

@router.patch("/{id}/status", response_model=GameCategory)
async def toggle_category_status(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
) -> Any:
    category = await crud_game_category.get(db=db, id=id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    update_data = GameCategoryUpdate(is_active=not category.is_active)
    return await crud_game_category.update(db=db, db_obj=category, obj_in=update_data)

@router.patch("/{id}/feature", response_model=GameCategory)
async def toggle_category_feature(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
) -> Any:
    category = await crud_game_category.get(db=db, id=id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    update_data = GameCategoryUpdate(is_featured=not category.is_featured)
    return await crud_game_category.update(db=db, db_obj=category, obj_in=update_data)

@router.delete("/{id}")
async def delete_game_category(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
) -> Any:
    category = await crud_game_category.get(db=db, id=id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
        
    # Check for assigned games
    games_count = await db.execute(
        select(func.count(Game.id)).where(Game.category_id == id)
    )
    if games_count.scalar_one() > 0:
        raise HTTPException(status_code=400, detail="Cannot delete category because games are assigned.")
        
    await crud_game_category.remove(db=db, id=id)
    return {"success": True, "message": "Category deleted"}
