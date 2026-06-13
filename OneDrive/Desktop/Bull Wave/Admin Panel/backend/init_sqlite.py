import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from db.session import SessionLocal
from crud import crud_admin
from schemas.admin import AdminCreate
import logging

logging.basicConfig(level=logging.INFO)

async def init_db():
    async with SessionLocal() as db:
        admin = await crud_admin.get_by_email(db, email="admin@bullwave.com")
        if not admin:
            admin_in = AdminCreate(
                email="admin@bullwave.com",
                password="password123",
                role="super_admin",
                is_active=True,
            )
            await crud_admin.create(db, obj_in=admin_in)
            logging.info("Default Admin created (admin@bullwave.com / password123)")
        else:
            logging.info("Admin already exists")

if __name__ == "__main__":
    asyncio.run(init_db())
