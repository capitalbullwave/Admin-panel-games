from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from schemas.user import User

class KYCBase(BaseModel):
    pan_number: Optional[str] = None
    pan_holder_name: Optional[str] = None
    pan_image_url: Optional[str] = None
    bank_account_name: Optional[str] = None
    bank_account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    bank_document_url: Optional[str] = None

class KYCSubmitPAN(BaseModel):
    pan_number: str
    pan_holder_name: str
    pan_image_url: str

class KYCSubmitBank(BaseModel):
    bank_account_name: str
    bank_account_number: str
    ifsc_code: str
    bank_document_url: str

class KYCSubmit(KYCBase):
    pass

class AdminKYCCreate(KYCBase):
    user_id: int
    status: Optional[str] = "pending"

class KYCApproveReject(BaseModel):
    status: str
    rejection_reason: Optional[str] = None

class KYCResponse(KYCBase):
    id: int
    user_id: int
    status: str
    rejection_reason: Optional[str] = None
    submitted_at: datetime
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[int] = None
    user: Optional[User] = None

    class Config:
        from_attributes = True

class KYCDashboardStats(BaseModel):
    total_requests: int
    pending_count: int
    approved_count: int
    rejected_count: int
    today_requests: int
    approval_rate: float
    rejection_rate: float

# Aliases for compatibility
KYCCreate = KYCSubmit
KYCUpdate = KYCApproveReject
KYC = KYCResponse
