import asyncio
from db.session import engine
from sqlalchemy import text

async def fix():
    async with engine.begin() as conn:
        try:
            await conn.execute(text("DROP TABLE alembic_version"))
            print("Dropped alembic_version table.")
        except Exception as e:
            print("Error:", e)

if __name__ == "__main__":
    asyncio.run(fix())
