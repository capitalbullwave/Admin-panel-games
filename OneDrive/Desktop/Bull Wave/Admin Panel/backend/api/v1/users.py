from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional

from db.session import SessionLocal
from api.deps import get_db, get_current_active_admin
from core.security import get_password_hash
from models.user import User
from models.wallet import Wallet
from schemas.user import User as UserSchema, UserCreate, UserUpdate

router = APIRouter()

@router.post("/", response_model=UserSchema)
async def create_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_admin = Depends(get_current_active_admin)
):
    # Check if mobile already exists
    result = await db.execute(select(User).filter(User.mobile == user_in.mobile))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Mobile number already registered")
        
    # Check if email already exists (if provided)
    if user_in.email:
        email_result = await db.execute(select(User).filter(User.email == user_in.email))
        if email_result.scalars().first():
            raise HTTPException(status_code=400, detail="Email already registered")
            
    # Check if referral code already exists (if provided)
    if user_in.referral_code:
        ref_result = await db.execute(select(User).filter(User.referral_code == user_in.referral_code))
        if ref_result.scalars().first():
            raise HTTPException(status_code=400, detail="Referral code already exists")
        
    db_user = User(
        name=user_in.name,
        email=user_in.email,
        mobile=user_in.mobile,
        status=user_in.status,
        referral_code=user_in.referral_code,
        hashed_password=get_password_hash(user_in.password)
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    
    # Initialize wallet for new user
    db_wallet = Wallet(user_id=db_user.id)
    db.add(db_wallet)
    await db.commit()
    await db.refresh(db_user) # Refresh to get eager loaded relationships if any
    
    # Explicitly load the wallet for the response
    user_with_wallet = await db.execute(select(User).options(selectinload(User.wallet)).filter(User.id == db_user.id))
    return user_with_wallet.scalars().first()

@router.get("/", response_model=List[UserSchema])
async def read_users(
    skip: int = 0, limit: int = 100,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_admin = Depends(get_current_active_admin)
):
    query = select(User).options(selectinload(User.wallet))
    if status:
        query = query.filter(User.status == status)
    result = await db.execute(query.offset(skip).limit(limit).order_by(User.id.desc()))
    return result.scalars().all()

@router.get("/{user_id}", response_model=UserSchema)
async def read_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin = Depends(get_current_active_admin)
):
    result = await db.execute(select(User).options(selectinload(User.wallet)).filter(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

from pydantic import BaseModel
class UserStatusUpdate(BaseModel):
    status: str

@router.patch("/{user_id}/status", response_model=UserSchema)
async def update_user_status(
    user_id: int,
    status_data: UserStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin = Depends(get_current_active_admin)
):
    result = await db.execute(select(User).options(selectinload(User.wallet)).filter(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if status_data.status not in ["Active", "Blocked"]:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    user.status = status_data.status
    await db.commit()
    await db.refresh(user)
    return user

@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin = Depends(get_current_active_admin)
):
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    await db.delete(user)
    await db.commit()
    return {"message": "User deleted successfully"}
