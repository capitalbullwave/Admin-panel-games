from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from db.base_class import Base

class Wallet(Base):
    __tablename__ = "wallet"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), unique=True, index=True, nullable=False)
    
    deposit_balance = Column(Float, default=0.0)
    winning_balance = Column(Float, default=0.0)
    bonus_balance = Column(Float, default=0.0)
    locked_balance = Column(Float, default=0.0)
    
    # Keeping old columns if needed for statistics or migration, but we can set them as optional
    total_deposited = Column(Float, default=0.0)
    total_withdrawn = Column(Float, default=0.0)
    total_won = Column(Float, default=0.0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="wallet")


class Transaction(Base):
    __tablename__ = "wallet_transactions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), index=True, nullable=False)
    transaction_id = Column(String, unique=True, index=True, nullable=False)
    transaction_type = Column(String, nullable=False) # Deposit, Withdrawal, Bonus Credit, Bonus Debit, Manual Credit, Manual Debit, Game Bet, Game Win, Refund, Penalty, Cashback, Referral Bonus
    amount = Column(Float, nullable=False)
    opening_balance = Column(Float, nullable=False, default=0.0)
    closing_balance = Column(Float, nullable=False, default=0.0)
    status = Column(String, default="Pending") # Pending, Completed, Failed, Rejected
    reference_type = Column(String, nullable=True) # e.g., 'Game', 'Deposit', 'Withdrawal', 'Admin'
    reference_id = Column(String, nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="transactions")


class Deposit(Base):
    __tablename__ = "deposits"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), index=True, nullable=False)
    amount = Column(Float, nullable=False)
    gateway = Column(String, nullable=True)
    gateway_transaction_id = Column(String, nullable=True, unique=True)
    status = Column(String, default="Pending") # Pending, Success, Failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="deposits")


class Withdrawal(Base):
    __tablename__ = "withdrawals"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), index=True, nullable=False)
    amount = Column(Float, nullable=False)
    bank_name = Column(String, nullable=True)
    account_number = Column(String, nullable=True)
    upi_id = Column(String, nullable=True)
    status = Column(String, default="Pending") # Pending, Approved, Rejected
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="withdrawals")
    admin = relationship("Admin")


class WalletAuditLog(Base):
    __tablename__ = "wallet_audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("user.id"), index=True, nullable=False)
    action = Column(String, nullable=False) # Manual Credit, Manual Debit, Freeze, Unfreeze
    old_balance = Column(Float, nullable=False)
    new_balance = Column(Float, nullable=False)
    remarks = Column(Text, nullable=True)
    ip_address = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    admin = relationship("Admin")
    user = relationship("User", back_populates="wallet_audit_logs")
