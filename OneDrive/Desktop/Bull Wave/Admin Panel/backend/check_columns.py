import asyncio
import asyncpg
from core.config import settings

async def check_columns():
    try:
        conn = await asyncpg.connect(
            user=settings.POSTGRES_USER, 
            password=settings.POSTGRES_PASSWORD, 
            host=settings.POSTGRES_SERVER, 
            port=settings.POSTGRES_PORT, 
            database=settings.POSTGRES_DB
        )
        columns = await conn.fetch("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'admins'")
        for c in columns:
            print(f"{c['column_name']}: {c['data_type']}")
            
        admins = await conn.fetch("SELECT * FROM admins LIMIT 1")
        print("Admins:", admins)
        
        await conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_columns())
