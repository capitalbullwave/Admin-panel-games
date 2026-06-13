from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
import uuid

from repositories.wallet_repository import WalletRepository
from models.wallet import Wallet, Transaction, WalletAuditLog, Withdrawal
from schemas.wallet import ManualCreditRequest, ManualDebitRequest, FreezeRequest, UnfreezeRequest

class WalletService:
    
    @staticmethod
    async def get_or_create_wallet(db: AsyncSession, user_id: int) -> Wallet:
        wallet = await WalletRepository.get_wallet_by_user_id(db, user_id)
        if not wallet:
            wallet = await WalletRepository.create_wallet(db, user_id)
        return wallet

    @staticmethod
    async def manual_credit(db: AsyncSession, req: ManualCreditRequest, admin_id: int) -> Wallet:
        wallet = await WalletService.get_or_create_wallet(db, req.user_id)
        
        old_balance = wallet.deposit_balance + wallet.winning_balance + wallet.bonus_balance
        
        if req.wallet_type == "deposit":
            wallet.deposit_balance += req.amount
            wallet.total_deposited += req.amount
        elif req.wallet_type == "winning":
            wallet.winning_balance += req.amount
            wallet.total_won += req.amount
        elif req.wallet_type == "bonus":
            wallet.bonus_balance += req.amount
        else:
            raise HTTPException(status_code=400, detail="Invalid wallet type")
            
        new_balance = wallet.deposit_balance + wallet.winning_balance + wallet.bonus_balance
        
        # Create Transaction
        transaction = Transaction(
            user_id=req.user_id,
            transaction_id=str(uuid.uuid4()),
            transaction_type="Manual Credit",
            amount=req.amount,
            opening_balance=old_balance,
            closing_balance=new_balance,
            status="Completed",
            reference_type="Admin",
            reference_id=str(admin_id),
            remarks=req.reason
        )
        await WalletRepository.create_transaction(db, transaction)
        
        # Create Audit Log
        audit_log = WalletAuditLog(
            admin_id=admin_id,
            user_id=req.user_id,
            action="Manual Credit",
            old_balance=old_balance,
            new_balance=new_balance,
            remarks=req.reason
        )
        await WalletRepository.create_audit_log(db, audit_log)
        
        await db.commit()
        await db.refresh(wallet)
        return wallet

    @staticmethod
    async def manual_debit(db: AsyncSession, req: ManualDebitRequest, admin_id: int) -> Wallet:
        wallet = await WalletRepository.get_wallet_by_user_id(db, req.user_id)
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found")
            
        old_balance = wallet.deposit_balance + wallet.winning_balance + wallet.bonus_balance
        
        if req.wallet_type == "deposit":
            if wallet.deposit_balance < req.amount:
                raise HTTPException(status_code=400, detail="Insufficient deposit balance")
            wallet.deposit_balance -= req.amount
        elif req.wallet_type == "winning":
            if wallet.winning_balance < req.amount:
                raise HTTPException(status_code=400, detail="Insufficient winning balance")
            wallet.winning_balance -= req.amount
        elif req.wallet_type == "bonus":
            if wallet.bonus_balance < req.amount:
                raise HTTPException(status_code=400, detail="Insufficient bonus balance")
            wallet.bonus_balance -= req.amount
        else:
            raise HTTPException(status_code=400, detail="Invalid wallet type")
            
        new_balance = wallet.deposit_balance + wallet.winning_balance + wallet.bonus_balance
        
        # Create Transaction
        transaction = Transaction(
            user_id=req.user_id,
            transaction_id=str(uuid.uuid4()),
            transaction_type="Manual Debit",
            amount=-req.amount,
            opening_balance=old_balance,
            closing_balance=new_balance,
            status="Completed",
            reference_type="Admin",
            reference_id=str(admin_id),
            remarks=req.reason
        )
        await WalletRepository.create_transaction(db, transaction)
        
        # Create Audit Log
        audit_log = WalletAuditLog(
            admin_id=admin_id,
            user_id=req.user_id,
            action="Manual Debit",
            old_balance=old_balance,
            new_balance=new_balance,
            remarks=req.reason
        )
        await WalletRepository.create_audit_log(db, audit_log)
        
        await db.commit()
        await db.refresh(wallet)
        return wallet

    @staticmethod
    async def freeze_wallet(db: AsyncSession, req: FreezeRequest, admin_id: int) -> Wallet:
        wallet = await WalletRepository.get_wallet_by_user_id(db, req.user_id)
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found")
            
        if wallet.winning_balance < req.amount:
            raise HTTPException(status_code=400, detail="Insufficient winning balance to freeze")
            
        old_balance = wallet.deposit_balance + wallet.winning_balance + wallet.bonus_balance
        
        wallet.winning_balance -= req.amount
        wallet.locked_balance += req.amount
        
        new_balance = wallet.deposit_balance + wallet.winning_balance + wallet.bonus_balance
        
        audit_log = WalletAuditLog(
            admin_id=admin_id,
            user_id=req.user_id,
            action="Freeze",
            old_balance=old_balance,
            new_balance=new_balance,
            remarks=f"Amount: {req.amount}. Reason: {req.reason}"
        )
        await WalletRepository.create_audit_log(db, audit_log)
        
        await db.commit()
        await db.refresh(wallet)
        return wallet

    @staticmethod
    async def unfreeze_wallet(db: AsyncSession, req: UnfreezeRequest, admin_id: int) -> Wallet:
        wallet = await WalletRepository.get_wallet_by_user_id(db, req.user_id)
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found")
            
        if wallet.locked_balance < req.amount:
            raise HTTPException(status_code=400, detail="Insufficient locked balance to unfreeze")
            
        old_balance = wallet.deposit_balance + wallet.winning_balance + wallet.bonus_balance
        
        wallet.locked_balance -= req.amount
        wallet.winning_balance += req.amount
        
        new_balance = wallet.deposit_balance + wallet.winning_balance + wallet.bonus_balance
        
        audit_log = WalletAuditLog(
            admin_id=admin_id,
            user_id=req.user_id,
            action="Unfreeze",
            old_balance=old_balance,
            new_balance=new_balance,
            remarks=f"Amount: {req.amount}. Reason: {req.reason}"
        )
        await WalletRepository.create_audit_log(db, audit_log)
        
        await db.commit()
        await db.refresh(wallet)
        return wallet

    @staticmethod
    async def approve_withdrawal(db: AsyncSession, withdrawal_id: int, admin_id: int) -> Withdrawal:
        withdrawal = await WalletRepository.get_withdrawal_by_id(db, withdrawal_id)
        if not withdrawal:
            raise HTTPException(status_code=404, detail="Withdrawal not found")
            
        if withdrawal.status != "Pending":
            raise HTTPException(status_code=400, detail="Withdrawal is not pending")
            
        wallet = await WalletRepository.get_wallet_by_user_id(db, withdrawal.user_id)
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found")
            
        # Verify Balance again
        if wallet.winning_balance < withdrawal.amount:
            raise HTTPException(status_code=400, detail="Insufficient winning balance")
            
        old_balance = wallet.deposit_balance + wallet.winning_balance + wallet.bonus_balance
        wallet.winning_balance -= withdrawal.amount
        wallet.total_withdrawn += withdrawal.amount
        new_balance = wallet.deposit_balance + wallet.winning_balance + wallet.bonus_balance
        
        withdrawal.status = "Approved"
        withdrawal.approved_by = admin_id
        
        # Transaction Entry
        transaction = Transaction(
            user_id=withdrawal.user_id,
            transaction_id=str(uuid.uuid4()),
            transaction_type="Withdrawal",
            amount=-withdrawal.amount,
            opening_balance=old_balance,
            closing_balance=new_balance,
            status="Completed",
            reference_type="Withdrawal",
            reference_id=str(withdrawal.id),
            remarks="Withdrawal Approved"
        )
        await WalletRepository.create_transaction(db, transaction)
        
        audit_log = WalletAuditLog(
            admin_id=admin_id,
            user_id=withdrawal.user_id,
            action="Withdrawal Approved",
            old_balance=old_balance,
            new_balance=new_balance,
            remarks=f"Approved withdrawal {withdrawal.id}"
        )
        await WalletRepository.create_audit_log(db, audit_log)
        
        await db.commit()
        await db.refresh(withdrawal)
        return withdrawal

    @staticmethod
    async def reject_withdrawal(db: AsyncSession, withdrawal_id: int, admin_id: int, reason: str) -> Withdrawal:
        withdrawal = await WalletRepository.get_withdrawal_by_id(db, withdrawal_id)
        if not withdrawal:
            raise HTTPException(status_code=404, detail="Withdrawal not found")
            
        if withdrawal.status != "Pending":
            raise HTTPException(status_code=400, detail="Withdrawal is not pending")
            
        withdrawal.status = "Rejected"
        withdrawal.approved_by = admin_id
        
        audit_log = WalletAuditLog(
            admin_id=admin_id,
            user_id=withdrawal.user_id,
            action="Withdrawal Rejected",
            old_balance=0.0,
            new_balance=0.0,
            remarks=f"Rejected withdrawal {withdrawal.id}. Reason: {reason}"
        )
        await WalletRepository.create_audit_log(db, audit_log)
        
        await db.commit()
        await db.refresh(withdrawal)
        return withdrawal
