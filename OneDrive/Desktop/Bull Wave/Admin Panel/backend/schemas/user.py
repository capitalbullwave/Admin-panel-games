from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from schemas.wallet import WalletResponse

class UserBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    mobile: str
    referral_code: Optional[str] = None
    status: Optional[str] = "Active"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None
    status: Optional[str] = None

class UserInDBBase(UserBase):
    id: int
    created_at: datetime
    wallet: Optional[WalletResponse] = None

    class Config:
        from_attributes = True

class User(UserInDBBase):
    pass
