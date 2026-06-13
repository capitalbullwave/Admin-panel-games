import asyncio
import asyncpg
from core.config import settings

async def check_tables():
    try:
        conn = await asyncpg.connect(
            user=settings.POSTGRES_USER, 
            password=settings.POSTGRES_PASSWORD, 
            host=settings.POSTGRES_SERVER, 
            port=settings.POSTGRES_PORT, 
            database=settings.POSTGRES_DB
        )
        tables = await conn.fetch("SELECT tablename FROM pg_tables WHERE schemaname='public'")
        print("Tables in admin_panel:")
        for t in tables:
            print(t['tablename'])
            
        # If admin table exists, fetch admins
        if any(t['tablename'] == 'admin' for t in tables):
            admins = await conn.fetch("SELECT id, email FROM admin")
            print("Admins:", admins)
            
        await conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_tables())
