from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from db.session import SessionLocal
from api.deps import get_db
# In a real app we'd have get_current_active_user, but we'll mock it or use a placeholder for now
# For demonstration, we'll accept user_id directly or assume a user dependency exists
from models.user import User

# Temporary mock dependency for User Auth
async def get_current_user(user_id: int, db: AsyncSession = Depends(get_db)) -> User:
    from sqlalchemy.future import select
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

from crud.crud_kyc import kyc as crud_kyc
from schemas.kyc import KYCSubmitPAN, KYCSubmitBank, KYCResponse

router = APIRouter()


@router.post("/upload-pan", response_model=KYCResponse)
async def upload_pan(
    kyc_in: KYCSubmitPAN,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if duplicate PAN globally
    existing_pan = await crud_kyc.get_by_pan(db, pan_number=kyc_in.pan_number)
    if existing_pan and existing_pan.user_id != current_user.id:
        raise HTTPException(status_code=400, detail="PAN already registered to another user")

    kyc = await crud_kyc.get_by_user_id(db, user_id=current_user.id)
    if kyc:
        if kyc.status in ["approved", "under_review", "pending"]:
            raise HTTPException(status_code=400, detail=f"KYC already {kyc.status}")
        
        kyc = await crud_kyc.update(db, db_obj=kyc, obj_in=kyc_in.model_dump())
    else:
        from schemas.kyc import KYCSubmit
        kyc = await crud_kyc.create(db, obj_in=KYCSubmit(**kyc_in.model_dump()), user_id=current_user.id)
    return kyc

@router.post("/upload-bank-document", response_model=KYCResponse)
async def upload_bank(
    kyc_in: KYCSubmitBank,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    kyc = await crud_kyc.get_by_user_id(db, user_id=current_user.id)
    if not kyc:
        raise HTTPException(status_code=400, detail="Please upload PAN first")
    if kyc.status in ["approved", "under_review"]:
        raise HTTPException(status_code=400, detail=f"KYC already {kyc.status}")
        
    kyc = await crud_kyc.update(db, db_obj=kyc, obj_in=kyc_in.model_dump())
    
    # If both PAN and Bank are present, change status to pending automatically
    if kyc.pan_number and kyc.bank_account_number and kyc.status == "rejected":
        kyc = await crud_kyc.update(db, db_obj=kyc, obj_in={"status": "pending"})
        
    return kyc

@router.get("/status", response_model=dict)
async def get_kyc_status(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    kyc = await crud_kyc.get_by_user_id(db, user_id=current_user.id)
    if not kyc:
        return {"status": "not_submitted"}
    return {"status": kyc.status, "rejection_reason": kyc.rejection_reason}

@router.get("/details", response_model=Optional[KYCResponse])
async def get_kyc_details(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await crud_kyc.get_by_user_id(db, user_id=current_user.id)
