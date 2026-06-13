import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from core.config import settings

from sqlalchemy import text

async def main():
    engine = create_async_engine(settings.SQLALCHEMY_DATABASE_URI, echo=True)
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN totp_secret VARCHAR;"))
        except Exception as e:
            print("Error adding totp_secret:", e)
        
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN is_2fa_enabled BOOLEAN DEFAULT FALSE;"))
        except Exception as e:
            print("Error adding is_2fa_enabled:", e)

if __name__ == "__main__":
    asyncio.run(main())
