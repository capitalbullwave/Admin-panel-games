from fastapi.testclient import TestClient
from main import app
from db.session import SessionLocal
from models.admin import Admin
from core.security import create_access_token
from sqlalchemy.future import select
import asyncio

async def get_token():
    async with SessionLocal() as db:
        res = await db.execute(select(Admin).limit(1))
        admin = res.scalars().first()
        return create_access_token(subject=str(admin.id))

token = asyncio.run(get_token())

client = TestClient(app)
try:
    response = client.post(
        "/api/v1/users/",
        json={"name":"Test TestClient","mobile":"7777777779","status":"Active","password":"password123"},
        headers={"Authorization": f"Bearer {token}"}
    )
    print("Status:", response.status_code)
    print("JSON:", response.json())
except Exception as e:
    import traceback
    traceback.print_exc()
