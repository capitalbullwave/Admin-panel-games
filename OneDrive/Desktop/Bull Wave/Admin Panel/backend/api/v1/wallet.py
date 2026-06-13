from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from db.session import SessionLocal
from api.deps import get_db
from models.user import User
from models.wallet import Withdrawal
from repositories.wallet_repository import WalletRepository
from services.wallet_service import WalletService
from schemas.wallet import WalletResponse, TransactionResponse, WithdrawalResponse
from pydantic import BaseModel

async def get_current_user(user_id: int, db: AsyncSession = Depends(get_db)) -> User:
    from sqlalchemy.future import select
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

router = APIRouter()


@router.get("/", response_model=WalletResponse)
async def get_my_wallet(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wallet = await WalletService.get_or_create_wallet(db, current_user.id)
    return wallet

@router.get("/transactions", response_model=List[TransactionResponse])
async def get_my_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    transactions = await WalletRepository.get_transactions(db, user_id=current_user.id, skip=skip, limit=limit)
    return transactions

class UserWithdrawalRequest(BaseModel):
    amount: float
    bank_name: str
    account_number: str
    upi_id: str = None

@router.post("/withdraw", response_model=WithdrawalResponse)
async def request_withdrawal(
    req: UserWithdrawalRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Basic validation
    wallet = await WalletService.get_or_create_wallet(db, current_user.id)
    if wallet.winning_balance < req.amount:
        raise HTTPException(status_code=400, detail="Insufficient winning balance")
        
    withdrawal = Withdrawal(
        user_id=current_user.id,
        amount=req.amount,
        bank_name=req.bank_name,
        account_number=req.account_number,
        upi_id=req.upi_id,
        status="Pending"
    )
    db.add(withdrawal)
    await db.commit()
    await db.refresh(withdrawal)
    return withdrawal
