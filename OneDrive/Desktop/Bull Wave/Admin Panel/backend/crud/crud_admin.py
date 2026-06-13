from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from models.admin import Admin
from schemas.admin import AdminCreate, AdminUpdate
from core.security import get_password_hash, verify_password

async def get_by_email(db: AsyncSession, *, email: str) -> Optional[Admin]:
    result = await db.execute(select(Admin).filter(Admin.email == email))
    return result.scalars().first()

async def create(db: AsyncSession, *, obj_in: AdminCreate) -> Admin:
    db_obj = Admin(
        email=obj_in.email,
        hashed_password=get_password_hash(obj_in.password),
        role="admin",
        is_active=obj_in.is_active,
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def authenticate(
    db: AsyncSession, *, email: str, password: str
) -> Optional[Admin]:
    admin = await get_by_email(db, email=email)
    if not admin:
        return None
    if not verify_password(password, admin.hashed_password):
        return None
    return admin

async def is_active(admin: Admin) -> bool:
    return admin.is_active

async def is_super_admin(admin: Admin) -> bool:
    return admin.role == "super_admin"
