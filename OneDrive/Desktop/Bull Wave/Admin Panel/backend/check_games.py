import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from core.config import settings
from sqlalchemy import text

async def main():
    engine = create_async_engine(settings.SQLALCHEMY_DATABASE_URI, echo=False)
    async with engine.begin() as conn:
        result = await conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'games'"))
        cols = [row[0] for row in result.all()]
        print("Columns in games:", cols)

if __name__ == "__main__":
    asyncio.run(main())
