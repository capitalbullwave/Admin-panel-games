import asyncio
from db.session import SessionLocal
from models.kyc import KYC
from sqlalchemy import update

async def update_kycs():
    async with SessionLocal() as db:
        await db.execute(update(KYC).values(pan_image_url='/static/uploads/realistic_dummy_pan.png', bank_document_url='/static/uploads/realistic_dummy_bank.png'))
        await db.commit()
    print('Updated all KYC images!')

if __name__ == "__main__":
    asyncio.run(update_kycs())
