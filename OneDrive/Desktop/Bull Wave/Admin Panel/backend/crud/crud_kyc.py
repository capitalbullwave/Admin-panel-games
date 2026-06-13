from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timezone

from models.kyc import KYC
from models.kyc_audit import KYCAuditLog
from schemas.kyc import KYCSubmit, KYCApproveReject
from schemas.kyc_audit import KYCAuditLogCreate

class CRUDKYC:
    async def get(self, db: AsyncSession, id: int) -> Optional[KYC]:
        result = await db.execute(select(KYC).filter(KYC.id == id))
        return result.scalars().first()

    async def get_by_user_id(self, db: AsyncSession, user_id: int) -> Optional[KYC]:
        result = await db.execute(select(KYC).filter(KYC.user_id == user_id))
        return result.scalars().first()

    async def get_by_pan(self, db: AsyncSession, pan_number: str) -> Optional[KYC]:
        result = await db.execute(select(KYC).filter(KYC.pan_number == pan_number))
        return result.scalars().first()

    async def create(self, db: AsyncSession, obj_in: KYCSubmit, user_id: int) -> KYC:
        db_obj = KYC(
            **obj_in.model_dump(),
            user_id=user_id,
            status="pending"
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(self, db: AsyncSession, db_obj: KYC, obj_in: dict) -> KYC:
        for field, value in obj_in.items():
            setattr(db_obj, field, value)
        
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update_status(
        self, db: AsyncSession, db_obj: KYC, status_in: KYCApproveReject, admin_id: int
    ) -> KYC:
        old_status = db_obj.status
        new_status = status_in.status
        
        db_obj.status = new_status
        db_obj.rejection_reason = status_in.rejection_reason
        db_obj.reviewed_by = admin_id
        db_obj.reviewed_at = datetime.now(timezone.utc)
        
        # Create Audit Log
        audit_log = KYCAuditLog(
            kyc_id=db_obj.id,
            action=f"Status changed to {new_status}",
            old_status=old_status,
            new_status=new_status,
            admin_id=admin_id,
            remarks=status_in.rejection_reason
        )
        db.add(audit_log)
        
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def get_multi_by_status(
        self, db: AsyncSession, status: str, skip: int = 0, limit: int = 100
    ) -> List[KYC]:
        result = await db.execute(
            select(KYC).options(selectinload(KYC.user)).filter(KYC.status == status).offset(skip).limit(limit).order_by(KYC.id.desc())
        )
        return result.scalars().all()

    async def get_dashboard_stats(self, db: AsyncSession) -> dict:
        total = await db.execute(select(func.count(KYC.id)))
        pending = await db.execute(select(func.count(KYC.id)).filter(KYC.status == 'pending'))
        approved = await db.execute(select(func.count(KYC.id)).filter(KYC.status == 'approved'))
        rejected = await db.execute(select(func.count(KYC.id)).filter(KYC.status == 'rejected'))
        
        # Today's requests
        today = datetime.now(timezone.utc).date()
        today_start = datetime(today.year, today.month, today.day, tzinfo=timezone.utc)
        today_reqs = await db.execute(select(func.count(KYC.id)).filter(KYC.submitted_at >= today_start))
        
        total_val = total.scalar() or 0
        approved_val = approved.scalar() or 0
        rejected_val = rejected.scalar() or 0
        
        return {
            "total_requests": total_val,
            "pending_count": pending.scalar() or 0,
            "approved_count": approved_val,
            "rejected_count": rejected_val,
            "today_requests": today_reqs.scalar() or 0,
            "approval_rate": (approved_val / total_val * 100) if total_val > 0 else 0,
            "rejection_rate": (rejected_val / total_val * 100) if total_val > 0 else 0
        }

kyc = CRUDKYC()
