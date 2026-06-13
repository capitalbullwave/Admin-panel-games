import asyncio
import asyncpg

async def drop():
    conn = await asyncpg.connect('postgresql://postgres:4234@localhost:5432/bullwave-userpanel')
    await conn.execute('DROP TABLE IF EXISTS wallet_transactions CASCADE;')
    await conn.execute('DROP TABLE IF EXISTS wallet CASCADE;')
    await conn.close()
    print("Tables dropped successfully.")

asyncio.run(drop())
