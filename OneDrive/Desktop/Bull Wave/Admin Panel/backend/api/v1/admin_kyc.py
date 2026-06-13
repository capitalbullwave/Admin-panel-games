from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from db.session import SessionLocal
from api.deps import get_db, get_current_active_admin
from models.admin import Admin
from crud.crud_kyc import kyc as crud_kyc
from schemas.kyc import KYCResponse, KYCApproveReject, KYCDashboardStats, AdminKYCCreate

router = APIRouter()

@router.get("/stats", response_model=KYCDashboardStats)
async def get_kyc_stats(
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_active_admin)
):
    return await crud_kyc.get_dashboard_stats(db)

@router.post("/add", response_model=KYCResponse)
async def admin_add_kyc(
    kyc_data: AdminKYCCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_active_admin)
):
    # Check if user already has KYC
    existing_kyc = await crud_kyc.get_by_user_id(db, user_id=kyc_data.user_id)
    if existing_kyc:
        raise HTTPException(status_code=400, detail="User already has a KYC record")

    from schemas.kyc import KYCSubmit
    submit_data = KYCSubmit(**kyc_data.model_dump(exclude={"user_id", "status"}))
    kyc = await crud_kyc.create(db, obj_in=submit_data, user_id=kyc_data.user_id)
    
    if kyc_data.status != "pending":
        kyc = await crud_kyc.update(db, db_obj=kyc, obj_in={"status": kyc_data.status})
        
    return kyc

@router.get("/pending", response_model=List[KYCResponse])
async def get_pending_kyc(
    skip: int = 0, limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_active_admin)
):
    return await crud_kyc.get_multi_by_status(db, status="pending", skip=skip, limit=limit)

@router.get("/approved", response_model=List[KYCResponse])
async def get_approved_kyc(
    skip: int = 0, limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_active_admin)
):
    return await crud_kyc.get_multi_by_status(db, status="approved", skip=skip, limit=limit)

@router.get("/rejected", response_model=List[KYCResponse])
async def get_rejected_kyc(
    skip: int = 0, limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_active_admin)
):
    return await crud_kyc.get_multi_by_status(db, status="rejected", skip=skip, limit=limit)

@router.get("/under-review", response_model=List[KYCResponse])
async def get_under_review_kyc(
    skip: int = 0, limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_active_admin)
):
    return await crud_kyc.get_multi_by_status(db, status="under_review", skip=skip, limit=limit)

@router.get("/{user_id}", response_model=KYCResponse)
async def get_kyc_by_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_active_admin)
):
    kyc_record = await crud_kyc.get_by_user_id(db, user_id=user_id)
    if not kyc_record:
        raise HTTPException(status_code=404, detail="KYC not found for this user")
    return kyc_record

@router.put("/approve/{kyc_id}", response_model=KYCResponse)
async def approve_kyc(
    kyc_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_active_admin)
):
    kyc_record = await crud_kyc.get(db, id=kyc_id)
    if not kyc_record:
        raise HTTPException(status_code=404, detail="KYC not found")
    
    return await crud_kyc.update_status(
        db, db_obj=kyc_record, status_in=KYCApproveReject(status="approved"), admin_id=current_admin.id
    )

@router.put("/reject/{kyc_id}", response_model=KYCResponse)
async def reject_kyc(
    kyc_id: int,
    rejection_data: KYCApproveReject,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_active_admin)
):
    kyc_record = await crud_kyc.get(db, id=kyc_id)
    if not kyc_record:
        raise HTTPException(status_code=404, detail="KYC not found")
    
    return await crud_kyc.update_status(
        db, db_obj=kyc_record, status_in=KYCApproveReject(status="rejected", rejection_reason=rejection_data.rejection_reason), admin_id=current_admin.id
    )

@router.put("/under-review/{kyc_id}", response_model=KYCResponse)
async def under_review_kyc(
    kyc_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_active_admin)
):
    kyc_record = await crud_kyc.get(db, id=kyc_id)
    if not kyc_record:
        raise HTTPException(status_code=404, detail="KYC not found")
    
    return await crud_kyc.update_status(
        db, db_obj=kyc_record, status_in=KYCApproveReject(status="under_review"), admin_id=current_admin.id
    )
