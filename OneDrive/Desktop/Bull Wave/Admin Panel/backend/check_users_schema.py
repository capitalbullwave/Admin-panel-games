import asyncio
import asyncpg
from core.config import settings

async def check_schema():
    try:
        conn = await asyncpg.connect(
            user="postgres", 
            password="4234", 
            host="localhost", 
            port=5432, 
            database="bullwave-userpanel"
        )
        columns = await conn.fetch("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'")
        for c in columns:
            print(f"{c['column_name']}: {c['data_type']}")
            
        users = await conn.fetch("SELECT id, email, username, role FROM users LIMIT 2")
        print("Users:", users)
        
        await conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_schema())
