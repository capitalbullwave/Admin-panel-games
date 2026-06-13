from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class KYCAuditLogBase(BaseModel):
    action: str
    old_status: Optional[str] = None
    new_status: Optional[str] = None
    remarks: Optional[str] = None

class KYCAuditLogCreate(KYCAuditLogBase):
    kyc_id: int
    admin_id: int

class KYCAuditLogResponse(KYCAuditLogBase):
    id: int
    kyc_id: int
    admin_id: int
    created_at: datetime

    class Config:
        from_attributes = True
