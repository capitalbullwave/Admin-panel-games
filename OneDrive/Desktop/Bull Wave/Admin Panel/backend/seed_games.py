import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from core.config import settings
from sqlalchemy import text

async def seed_games():
    engine = create_async_engine(settings.SQLALCHEMY_DATABASE_URI, echo=False)
    async with engine.begin() as conn:
        # First, find the "Live Casino" category
        result = await conn.execute(text("SELECT id FROM game_categories WHERE name ILIKE '%Live Casino%' LIMIT 1;"))
        row = result.first()
        
        if not row:
            print("Error: Could not find 'Live Casino' category. Let's create it first.")
            await conn.execute(text("""
                INSERT INTO game_categories (name, slug, description, is_active, display_order) 
                VALUES ('Live Casino', 'live-casino', 'Real-time live dealer games', true, 1)
            """))
            result = await conn.execute(text("SELECT id FROM game_categories WHERE slug = 'live-casino' LIMIT 1;"))
            row = result.first()
            
        category_id = row[0]
        print(f"Using category_id: {category_id} for Live Casino")
        
        # Live Casino Games Data
        games_data = [
            {
                "name": "Crazy Time",
                "slug": "crazy-time",
                "short_description": "Evolution's biggest live game show.",
                "min_bet": 10.0,
                "max_bet": 50000.0,
                "is_featured": True,
                "is_popular": True
            },
            {
                "name": "Lightning Roulette",
                "slug": "lightning-roulette",
                "short_description": "Electrifying European Roulette with multipliers.",
                "min_bet": 20.0,
                "max_bet": 100000.0,
                "is_featured": True,
                "is_popular": True
            },
            {
                "name": "Monopoly Live",
                "slug": "monopoly-live",
                "short_description": "A unique live online game show based on the world's best-loved board game.",
                "min_bet": 10.0,
                "max_bet": 25000.0,
                "is_featured": False,
                "is_popular": True
            },
            {
                "name": "Live Baccarat",
                "slug": "live-baccarat",
                "short_description": "Classic live dealer baccarat.",
                "min_bet": 50.0,
                "max_bet": 200000.0,
                "is_featured": False,
                "is_popular": False
            }
        ]
        
        for game in games_data:
            try:
                await conn.execute(
                    text("""
                        INSERT INTO games (category_id, name, slug, short_description, min_bet, max_bet, is_featured, is_popular, status) 
                        VALUES (:category_id, :name, :slug, :short_description, :min_bet, :max_bet, :is_featured, :is_popular, true)
                        ON CONFLICT (slug) DO NOTHING;
                    """),
                    {
                        "category_id": category_id,
                        "name": game["name"],
                        "slug": game["slug"],
                        "short_description": game["short_description"],
                        "min_bet": game["min_bet"],
                        "max_bet": game["max_bet"],
                        "is_featured": game["is_featured"],
                        "is_popular": game["is_popular"]
                    }
                )
                print(f"Added game: {game['name']}")
            except Exception as e:
                print(f"Failed to add {game['name']}: {e}")

if __name__ == "__main__":
    asyncio.run(seed_games())
