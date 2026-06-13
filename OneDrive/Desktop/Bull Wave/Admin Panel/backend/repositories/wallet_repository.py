from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, desc, asc
from typing import List, Optional
from datetime import datetime

from models.wallet import Wallet, Transaction, Deposit, Withdrawal, WalletAuditLog

class WalletRepository:
    
    @staticmethod
    async def get_wallet_by_user_id(db: AsyncSession, user_id: int) -> Optional[Wallet]:
        result = await db.execute(select(Wallet).filter(Wallet.user_id == user_id))
        return result.scalars().first()
    
    @staticmethod
    async def create_wallet(db: AsyncSession, user_id: int) -> Wallet:
        wallet = Wallet(user_id=user_id)
        db.add(wallet)
        await db.flush()
        return wallet

    @staticmethod
    async def get_transactions(db: AsyncSession, user_id: Optional[int] = None, skip: int = 0, limit: int = 100) -> List[Transaction]:
        query = select(Transaction).order_by(desc(Transaction.created_at)).offset(skip).limit(limit)
        if user_id:
            query = query.filter(Transaction.user_id == user_id)
        result = await db.execute(query)
        return list(result.scalars().all())
    
    @staticmethod
    async def create_transaction(db: AsyncSession, transaction: Transaction) -> Transaction:
        db.add(transaction)
        await db.flush()
        return transaction
    
    @staticmethod
    async def create_audit_log(db: AsyncSession, audit_log: WalletAuditLog) -> WalletAuditLog:
        db.add(audit_log)
        await db.flush()
        return audit_log
    
    @staticmethod
    async def get_deposits(db: AsyncSession, user_id: Optional[int] = None, skip: int = 0, limit: int = 100) -> List[Deposit]:
        query = select(Deposit).order_by(desc(Deposit.created_at)).offset(skip).limit(limit)
        if user_id:
            query = query.filter(Deposit.user_id == user_id)
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def get_deposit_by_id(db: AsyncSession, deposit_id: int) -> Optional[Deposit]:
        result = await db.execute(select(Deposit).filter(Deposit.id == deposit_id))
        return result.scalars().first()

    @staticmethod
    async def get_withdrawals(db: AsyncSession, user_id: Optional[int] = None, skip: int = 0, limit: int = 100) -> List[Withdrawal]:
        query = select(Withdrawal).order_by(desc(Withdrawal.created_at)).offset(skip).limit(limit)
        if user_id:
            query = query.filter(Withdrawal.user_id == user_id)
        result = await db.execute(query)
        return list(result.scalars().all())
    
    @staticmethod
    async def get_withdrawal_by_id(db: AsyncSession, withdrawal_id: int) -> Optional[Withdrawal]:
        result = await db.execute(select(Withdrawal).filter(Withdrawal.id == withdrawal_id))
        return result.scalars().first()
