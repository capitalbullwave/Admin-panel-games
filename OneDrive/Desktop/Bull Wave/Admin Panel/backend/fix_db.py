import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from core.config import settings
from db.base_class import Base
from sqlalchemy import text

# Import all models to ensure they are registered with Base
import models.admin
import models.user
import models.game_categories
import models.game_providers
import models.games

async def main():
    engine = create_async_engine(settings.SQLALCHEMY_DATABASE_URI, echo=True)
    async with engine.begin() as conn:
        try:
            await conn.execute(text("DROP TABLE IF EXISTS games CASCADE;"))
            print("Successfully dropped games table")
        except Exception as e:
            print("Error dropping games table:", e)
            
        try:
            # Create all missing tables
            await conn.run_sync(Base.metadata.create_all)
            print("Successfully created missing tables")
        except Exception as e:
            print("Error creating tables:", e)

if __name__ == "__main__":
    asyncio.run(main())
