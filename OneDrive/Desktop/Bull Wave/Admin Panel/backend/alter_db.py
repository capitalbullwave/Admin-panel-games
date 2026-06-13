import asyncio
import asyncpg

async def run():
    conn = await asyncpg.connect('postgresql://postgres:4234@localhost:5432/bullwave-userpanel')
    try:
        await conn.execute('ALTER TABLE games ALTER COLUMN provider_id DROP NOT NULL')
        print("Successfully made provider_id nullable!")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(run())
