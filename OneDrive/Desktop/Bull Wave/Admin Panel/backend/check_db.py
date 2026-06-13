import asyncio
import asyncpg

async def check_databases():
    try:
        conn = await asyncpg.connect(user="postgres", password="4234", host="localhost", port=5432, database="postgres")
        dbs = await conn.fetch("SELECT datname FROM pg_database WHERE datname LIKE '%admin%'")
        for db in dbs:
            print(f"Found DB: {db['datname']}")
        await conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_databases())
