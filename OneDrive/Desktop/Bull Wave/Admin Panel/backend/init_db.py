import asyncio
import asyncpg
from core.config import settings

async def create_database():
    print(f"Attempting to create database {settings.POSTGRES_DB}...")
    try:
        # Connect to the default 'postgres' database to create the new one
        sys_conn = await asyncpg.connect(
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD,
            host=settings.POSTGRES_SERVER,
            port=settings.POSTGRES_PORT,
            database="postgres"
        )
        
        # Check if the target database exists
        exists = await sys_conn.fetchval(
            f"SELECT 1 FROM pg_database WHERE datname = '{settings.POSTGRES_DB}'"
        )
        
        if not exists:
            # We cannot run CREATE DATABASE inside a transaction block
            await sys_conn.execute(f'CREATE DATABASE "{settings.POSTGRES_DB}"')
            print(f"Database {settings.POSTGRES_DB} created successfully!")
        else:
            print(f"Database {settings.POSTGRES_DB} already exists.")
            
        await sys_conn.close()
    except Exception as e:
        print(f"Failed to create database: {e}")

if __name__ == "__main__":
    asyncio.run(create_database())
