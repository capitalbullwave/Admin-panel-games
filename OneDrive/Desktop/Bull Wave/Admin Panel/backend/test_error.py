import asyncio
from db.session import SessionLocal
from schemas.user import UserCreate
from api.v1.users import create_user
from fastapi import HTTPException
from models.user import User
from sqlalchemy.future import select
import main  # this will import all routers and models

async def main():
    async with SessionLocal() as db:
        # Create dummy admin
        class DummyAdmin:
            pass
        admin = DummyAdmin()
        
        user_in = UserCreate(
            name="Test Local",
            mobile="9876543221", # different mobile to avoid 400
            password="test",
            status="Active"
        )
        try:
            res = await create_user(user_in=user_in, db=db, current_admin=admin)
            print("Success:", res.id)
        except HTTPException as e:
            print("HTTP Exception:", e.status_code, e.detail)
        except Exception as e:
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
