import asyncio
import asyncpg

async def run():
    conn = await asyncpg.connect('postgresql://postgres:4234@localhost:5432/bullwave-userpanel')
    try:
        # Add new columns
        await conn.execute('ALTER TABLE game_categories ADD COLUMN IF NOT EXISTS description TEXT')
        await conn.execute('ALTER TABLE game_categories ADD COLUMN IF NOT EXISTS icon VARCHAR(255)')
        await conn.execute('ALTER TABLE game_categories ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(255)')
        await conn.execute('ALTER TABLE game_categories ADD COLUMN IF NOT EXISTS banner_url VARCHAR(255)')
        await conn.execute('ALTER TABLE game_categories ADD COLUMN IF NOT EXISTS color_code VARCHAR(50)')
        await conn.execute('ALTER TABLE game_categories ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE')
        await conn.execute('ALTER TABLE game_categories ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255)')
        await conn.execute('ALTER TABLE game_categories ADD COLUMN IF NOT EXISTS seo_description TEXT')
        await conn.execute('ALTER TABLE game_categories ADD COLUMN IF NOT EXISTS created_by INTEGER')
        await conn.execute('ALTER TABLE game_categories ADD COLUMN IF NOT EXISTS updated_by INTEGER')
        await conn.execute('ALTER TABLE game_categories ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP')
        await conn.execute('ALTER TABLE game_categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP')
        
        # Ensure default values are set in case columns already existed without them
        await conn.execute('ALTER TABLE game_categories ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP')
        await conn.execute('ALTER TABLE game_categories ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP')
        
        # Rename columns if they exist under old names, else create new ones
        try:
            await conn.execute('ALTER TABLE game_categories RENAME COLUMN sort_order TO display_order')
        except asyncpg.exceptions.UndefinedColumnError:
            await conn.execute('ALTER TABLE game_categories ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0')
            
        try:
            await conn.execute('ALTER TABLE game_categories RENAME COLUMN status TO is_active')
        except asyncpg.exceptions.UndefinedColumnError:
            await conn.execute('ALTER TABLE game_categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE')
            
        print("Successfully updated game_categories table!")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(run())
