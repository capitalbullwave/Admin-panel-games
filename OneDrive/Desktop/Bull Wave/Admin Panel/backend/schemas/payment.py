from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PaymentGatewayBase(BaseModel):
    name: str
    provider: str
    is_active: Optional[bool] = False

class PaymentGatewayCreate(PaymentGatewayBase):
    api_key: Optional[str] = None
    secret_key: Optional[str] = None

class PaymentGatewayUpdate(BaseModel):
    name: Optional[str] = None
    provider: Optional[str] = None
    api_key: Optional[str] = None
    secret_key: Optional[str] = None
    is_active: Optional[bool] = None

class PaymentGatewayInDBBase(PaymentGatewayBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class PaymentGateway(PaymentGatewayInDBBase):
    pass
