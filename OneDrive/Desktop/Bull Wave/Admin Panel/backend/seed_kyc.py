import asyncio
import os
import urllib.request
from sqlalchemy.ext.asyncio import AsyncSession
from db.session import SessionLocal, engine
import db.base  # This imports all models to resolve string relationships
from models.user import User
from models.kyc import KYC
import uuid

async def seed_data():
    UPLOAD_DIR = "static/uploads"
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    # Use the realistic generated images
    pan_url = "/static/uploads/realistic_dummy_pan.png"
    bank_url = "/static/uploads/realistic_dummy_bank.png"
    
    async with SessionLocal() as db:
        import random
        import string
        
        suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=4))

        # Create a dummy user
        dummy_user = User(
            username=f"rohit_sharma_{suffix}",
            name="Rohit Sharma",
            email=f"rohit_{suffix}@example.com",
            mobile=f"987654{random.randint(1000, 9999)}"
        )
        db.add(dummy_user)
        await db.commit()
        await db.refresh(dummy_user)
        user_1_id = dummy_user.id
        
        # Create a second dummy user
        dummy_user_2 = User(
            username=f"virat_kohli_{suffix}",
            name="Virat Kohli",
            email=f"virat_{suffix}@example.com",
            mobile=f"987654{random.randint(1000, 9999)}"
        )
        db.add(dummy_user_2)
        await db.commit()
        await db.refresh(dummy_user_2)
        user_2_id = dummy_user_2.id
        
        # Create pending KYC records
        kyc_1 = KYC(
            user_id=user_1_id,
            pan_number="ABCDE1234F",
            pan_holder_name="Rohit Sharma",
            pan_image_url=pan_url,
            bank_account_name="Rohit Sharma",
            bank_account_number="0000111122223333",
            ifsc_code="HDFC0001234",
            bank_document_url=bank_url,
            status="pending"
        )
        db.add(kyc_1)
        
        kyc_2 = KYC(
            user_id=user_2_id,
            pan_number="FGHIJ5678K",
            pan_holder_name="Virat Kohli",
            pan_image_url=pan_url,
            bank_account_name="Virat Kohli",
            bank_account_number="9999888877776666",
            ifsc_code="SBIN0004321",
            bank_document_url=bank_url,
            status="pending"
        )
        db.add(kyc_2)
        
        await db.commit()
        print("Dummy KYC data seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_data())
