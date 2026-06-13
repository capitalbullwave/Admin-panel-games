from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime

from db.session import SessionLocal
from api.deps import get_db, get_current_active_finance_admin
from models.admin import Admin
from repositories.wallet_repository import WalletRepository
from services.wallet_service import WalletService
from schemas.wallet import (
    WalletResponse,
    TransactionResponse,
    ManualCreditRequest,
    ManualDebitRequest,
    FreezeRequest,
    UnfreezeRequest,
    DepositResponse,
    WithdrawalResponse,
    WithdrawalApproveRequest,
    WithdrawalRejectRequest
)

router = APIRouter()

@router.get("/{user_id}", response_model=WalletResponse)
async def get_user_wallet(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_active_finance_admin)
):
    wallet = await WalletRepository.get_wallet_by_user_id(db, user_id)
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    return wallet

@router.get("/{user_id}/transactions", response_model=List[TransactionResponse])
async def get_wallet_transactions(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_active_finance_admin)
):
    transactions = await WalletRepository.get_transactions(db, user_id=user_id, skip=skip, limit=limit)
    return transactions

@router.post("/manual-credit", response_model=WalletResponse)
async def manual_credit(
    req: ManualCreditRequest,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_active_finance_admin)
):
    return await WalletService.manual_credit(db, req, current_admin.id)

@router.post("/manual-debit", response_model=WalletResponse)
async def manual_debit(
    req: ManualDebitRequest,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_active_finance_admin)
):
    return await WalletService.manual_debit(db, req, current_admin.id)

@router.post("/freeze", response_model=WalletResponse)
async def freeze_wallet(
    req: FreezeRequest,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_active_finance_admin)
):
    return await WalletService.freeze_wallet(db, req, current_admin.id)

@router.post("/unfreeze", response_model=WalletResponse)
async def unfreeze_wallet(
    req: UnfreezeRequest,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_active_finance_admin)
):
    return await WalletService.unfreeze_wallet(db, req, current_admin.id)

@router.get("/deposits", response_model=List[DepositResponse])
async def get_deposits(
    user_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_active_finance_admin)
):
    return await WalletRepository.get_deposits(db, user_id=user_id, skip=skip, limit=limit)

@router.get("/deposits/{deposit_id}", response_model=DepositResponse)
async def get_deposit(
    deposit_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_active_finance_admin)
):
    deposit = await WalletRepository.get_deposit_by_id(db, deposit_id)
    if not deposit:
        raise HTTPException(status_code=404, detail="Deposit not found")
    return deposit

@router.get("/withdrawals", response_model=List[WithdrawalResponse])
async def get_withdrawals(
    user_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_active_finance_admin)
):
    return await WalletRepository.get_withdrawals(db, user_id=user_id, skip=skip, limit=limit)

@router.get("/withdrawals/{withdrawal_id}", response_model=WithdrawalResponse)
async def get_withdrawal(
    withdrawal_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_active_finance_admin)
):
    withdrawal = await WalletRepository.get_withdrawal_by_id(db, withdrawal_id)
    if not withdrawal:
        raise HTTPException(status_code=404, detail="Withdrawal not found")
    return withdrawal

@router.post("/withdrawals/{withdrawal_id}/approve", response_model=WithdrawalResponse)
async def approve_withdrawal(
    withdrawal_id: int,
    req: WithdrawalApproveRequest,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_active_finance_admin)
):
    return await WalletService.approve_withdrawal(db, withdrawal_id, current_admin.id)

@router.post("/withdrawals/{withdrawal_id}/reject", response_model=WithdrawalResponse)
async def reject_withdrawal(
    withdrawal_id: int,
    req: WithdrawalRejectRequest,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_active_finance_admin)
):
    return await WalletService.reject_withdrawal(db, withdrawal_id, current_admin.id, req.reason)
