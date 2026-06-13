from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class WalletBase(BaseModel):
    deposit_balance: float = 0.0
    winning_balance: float = 0.0
    bonus_balance: float = 0.0
    locked_balance: float = 0.0
    total_deposited: float = 0.0
    total_withdrawn: float = 0.0
    total_won: float = 0.0

class WalletCreate(WalletBase):
    user_id: int

class WalletUpdate(BaseModel):
    deposit_balance: Optional[float] = None
    winning_balance: Optional[float] = None
    bonus_balance: Optional[float] = None
    locked_balance: Optional[float] = None

class WalletInDBBase(WalletBase):
    id: int
    user_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

from pydantic import computed_field

class WalletResponse(WalletInDBBase):
    @computed_field
    @property
    def total_balance(self) -> float:
        return self.deposit_balance + self.winning_balance + self.bonus_balance

class Wallet(WalletInDBBase):
    pass

class TransactionBase(BaseModel):
    amount: float
    transaction_type: str
    status: str = "Pending"
    reference_type: Optional[str] = None
    reference_id: Optional[str] = None
    remarks: Optional[str] = None

class TransactionCreate(TransactionBase):
    user_id: int
    transaction_id: str
    opening_balance: float
    closing_balance: float

class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    transaction_id: str
    opening_balance: float
    closing_balance: float
    created_at: datetime

    class Config:
        from_attributes = True

class Transaction(TransactionResponse):
    pass

class ManualCreditRequest(BaseModel):
    user_id: int
    amount: float = Field(..., gt=0)
    wallet_type: str = Field(..., description="deposit, winning, bonus")
    reason: str

class ManualDebitRequest(BaseModel):
    user_id: int
    amount: float = Field(..., gt=0)
    wallet_type: str = Field(..., description="deposit, winning, bonus")
    reason: str

class FreezeRequest(BaseModel):
    user_id: int
    amount: float = Field(..., gt=0)
    reason: str

class UnfreezeRequest(BaseModel):
    user_id: int
    amount: float = Field(..., gt=0)
    reason: str

class DepositResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    gateway: Optional[str]
    gateway_transaction_id: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class WithdrawalResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    bank_name: Optional[str]
    account_number: Optional[str]
    upi_id: Optional[str]
    status: str
    approved_by: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True

class WithdrawalApproveRequest(BaseModel):
    reason: Optional[str] = None

class WithdrawalRejectRequest(BaseModel):
    reason: str
