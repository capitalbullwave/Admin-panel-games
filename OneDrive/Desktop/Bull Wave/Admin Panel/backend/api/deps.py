from typing import AsyncGenerator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from core.config import settings
from db.session import SessionLocal
from models.admin import Admin
from schemas.token import TokenPayload
import crud.crud_admin as crud_admin

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session

async def get_current_admin(
    db: AsyncSession = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> Admin:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (jwt.JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    result = await db.execute(select(Admin).filter(Admin.id == int(token_data.sub)))
    admin = result.scalars().first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    return admin

async def get_current_active_admin(
    current_admin: Admin = Depends(get_current_admin),
) -> Admin:
    if not current_admin.is_active:
        raise HTTPException(status_code=400, detail="Inactive admin")
    return current_admin

async def get_current_active_super_admin(
    current_admin: Admin = Depends(get_current_admin),
) -> Admin:
    if not current_admin.role == "super_admin":
        raise HTTPException(
            status_code=403, detail="The admin doesn't have enough privileges"
        )
    return current_admin

async def get_current_active_finance_admin(
    current_admin: Admin = Depends(get_current_admin),
) -> Admin:
    if current_admin.role not in ["super_admin", "finance_admin"]:
        raise HTTPException(
            status_code=403, detail="The admin doesn't have finance privileges"
        )
    return current_admin
