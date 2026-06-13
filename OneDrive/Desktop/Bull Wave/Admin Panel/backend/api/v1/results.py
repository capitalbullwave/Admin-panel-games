from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from db.session import SessionLocal
from api.deps import get_db, get_current_active_admin
from models.result import Result
from schemas.result import Result as ResultSchema, ResultCreate

router = APIRouter()

@router.get("/", response_model=List[ResultSchema])
async def read_results(
    skip: int = 0, limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_admin = Depends(get_current_active_admin)
):
    result = await db.execute(select(Result).offset(skip).limit(limit))
    return result.scalars().all()

@router.post("/", response_model=ResultSchema)
async def declare_result(
    result_in: ResultCreate,
    db: AsyncSession = Depends(get_db),
    current_admin = Depends(get_current_active_admin)
):
    new_result = Result(**result_in.dict())
    db.add(new_result)
    await db.commit()
    await db.refresh(new_result)
    return new_result
