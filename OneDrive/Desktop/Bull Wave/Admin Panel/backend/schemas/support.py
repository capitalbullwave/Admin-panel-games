from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TicketBase(BaseModel):
    subject: str
    description: str
    priority: Optional[str] = "Medium"
    status: Optional[str] = "Open"

class TicketCreate(TicketBase):
    user_id: int
    ticket_number: str

class TicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None

class TicketInDBBase(TicketBase):
    id: int
    ticket_number: str
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Ticket(TicketInDBBase):
    pass
