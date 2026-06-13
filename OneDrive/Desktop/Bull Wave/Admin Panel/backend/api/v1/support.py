from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from db.session import SessionLocal
from api.deps import get_db, get_current_active_admin
from models.support import Ticket
from schemas.support import Ticket as TicketSchema, TicketUpdate

router = APIRouter()

@router.get("/", response_model=List[TicketSchema])
async def read_tickets(
    skip: int = 0, limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_admin = Depends(get_current_active_admin)
):
    result = await db.execute(select(Ticket).offset(skip).limit(limit))
    return result.scalars().all()

@router.put("/{ticket_id}", response_model=TicketSchema)
async def update_ticket(
    ticket_id: int,
    ticket_in: TicketUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin = Depends(get_current_active_admin)
):
    result = await db.execute(select(Ticket).filter(Ticket.id == ticket_id))
    ticket = result.scalars().first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    if ticket_in.status:
        ticket.status = ticket_in.status
    if ticket_in.priority:
        ticket.priority = ticket_in.priority
        
    await db.commit()
    await db.refresh(ticket)
    return ticket
