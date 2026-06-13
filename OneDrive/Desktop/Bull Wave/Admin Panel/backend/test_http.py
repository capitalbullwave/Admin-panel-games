import requests
import json
import urllib.request
import urllib.error
from db.session import SessionLocal
from models.admin import Admin
from core.security import create_access_token
from sqlalchemy.future import select
import asyncio

async def test_http():
    async with SessionLocal() as db:
        res = await db.execute(select(Admin).limit(1))
        admin = res.scalars().first()
        if not admin:
            print("No admin found!")
            return
            
        token = create_access_token(subject=str(admin.id))
        print("Generated Token for admin:", admin.id)
        
        req = urllib.request.Request(
            'http://127.0.0.1:8000/api/v1/users/',
            data=b'{"name":"Test HTTP","mobile":"7777777778","status":"Active","password":"password123"}',
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {token}'
            }
        )
        
        try:
            with urllib.request.urlopen(req) as response:
                print("Status:", response.status)
                print("Body:", response.read().decode())
        except urllib.error.HTTPError as e:
            print("HTTP Error:", e.code)
            print("Error Headers:", e.headers)
            print("Error Body:", e.read().decode())
        except urllib.error.URLError as e:
            print("URL Error:", e.reason)

if __name__ == "__main__":
    asyncio.run(test_http())
