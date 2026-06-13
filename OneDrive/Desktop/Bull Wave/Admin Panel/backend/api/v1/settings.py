import os
import shutil
from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from sqlalchemy.ext.asyncio import AsyncSession

from api.deps import get_db, get_current_active_super_admin, get_current_active_admin
from crud.crud_settings import settings as crud_settings
from schemas.settings import SettingInDB, SettingCreate, SettingUpdate, SettingsCategoryUpdate, SettingsAuditLogInDB
from models.user import User
from pydantic import BaseModel

router = APIRouter()

class CategoryStatus(BaseModel):
    name: str
    status: str

@router.get("/categories", response_model=List[CategoryStatus])
async def get_setting_categories(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
) -> Any:
    """
    Retrieve all available setting categories with their configuration status.
    """
    predefined = [
        "General Settings", "Referral Settings", "KYC Settings", "Wallet Settings", 
        "Payment Settings", "Bonus Settings", "Game Settings", "Security Settings", 
        "Notification Settings", "Registration Settings", "Support Settings", 
        "Tax & Compliance", "System Configuration", "Maintenance Settings"
    ]
    
    db_cats = await crud_settings.get_all_categories(db)
    all_cat_names = list(set(predefined + db_cats))
    
    result = []
    for cat in all_cat_names:
        settings = await crud_settings.get_by_category(db, category=cat)
        if not settings:
            result.append(CategoryStatus(name=cat, status="Needs Attention"))
            continue
            
        # Check if any setting is completely empty or null
        needs_attention = False
        for s in settings:
            if s.setting_value is None or str(s.setting_value).strip() == "":
                needs_attention = True
                break
                
        status_str = "Needs Attention" if needs_attention else "Configured"
        result.append(CategoryStatus(name=cat, status=status_str))
        
    return result

@router.get("/audit-logs", response_model=List[SettingsAuditLogInDB])
async def get_audit_logs(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
) -> Any:
    """
    Retrieve settings audit logs.
    """
    logs = await crud_settings.get_audit_logs(db, skip=skip, limit=limit)
    return logs

@router.post("/upload-logo", response_model=SettingInDB)
async def upload_logo(
    request: Request,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
) -> Any:
    """
    Upload a logo for the platform and update the General Settings.
    """
    # Create static/uploads directory if not exists
    upload_dir = os.path.join("static", "uploads", "settings")
    os.makedirs(upload_dir, exist_ok=True)

    file_extension = os.path.splitext(file.filename)[1]
    filename = f"platform_logo{file_extension}"
    file_path = os.path.join(upload_dir, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    logo_url = f"/static/uploads/settings/{filename}"
    
    # Update or create Setting
    setting_obj = await crud_settings.get_by_key(db, setting_key="Platform Logo")
    if setting_obj:
        updated = await crud_settings.update_setting(
            db, 
            db_obj=setting_obj, 
            obj_in=SettingUpdate(setting_value=logo_url), 
            user_id=current_user.id,
            ip_address=request.client.host if request.client else None
        )
    else:
        # Provide update via category settings create
        cat_update = SettingsCategoryUpdate(settings={"Platform Logo": logo_url})
        res = await crud_settings.update_category_settings(
            db, 
            category="General Settings", 
            settings_in=cat_update.settings, 
            user_id=current_user.id,
            ip_address=request.client.host if request.client else None
        )
        updated = res[0]

    return updated

@router.get("/{category}", response_model=List[SettingInDB])
async def read_settings_by_category(
    category: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
) -> Any:
    """
    Retrieve settings for a specific category.
    """
    settings = await crud_settings.get_by_category(db, category=category)
    return settings

@router.put("/{category}", response_model=List[SettingInDB])
async def update_settings_by_category(
    category: str,
    settings_in: SettingsCategoryUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
) -> Any:
    """
    Update multiple settings for a specific category.
    """
    updated_settings = await crud_settings.update_category_settings(
        db, 
        category=category, 
        settings_in=settings_in.settings, 
        user_id=current_user.id,
        ip_address=request.client.host if request.client else None
    )
    return updated_settings

@router.post("/", response_model=SettingInDB)
async def create_setting(
    *,
    db: AsyncSession = Depends(get_db),
    setting_in: SettingCreate,
    current_user: User = Depends(get_current_active_super_admin),
) -> Any:
    """
    Create new setting. Superadmin only.
    """
    setting = await crud_settings.get_by_key(db, setting_key=setting_in.setting_key)
    if setting:
        raise HTTPException(
            status_code=400,
            detail="The setting with this key already exists in the system.",
        )
    setting = await crud_settings.create(db, obj_in=setting_in)
    return setting

@router.delete("/{id}", response_model=SettingInDB)
async def delete_setting(
    *,
    db: AsyncSession = Depends(get_db),
    id: int,
    current_user: User = Depends(get_current_active_super_admin),
) -> Any:
    """
    Delete a setting. Superadmin only.
    """
    setting = await crud_settings.get(db=db, id=id)
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    setting = await crud_settings.remove(db=db, id=id)
    return setting

@router.patch("/{id}/status", response_model=SettingInDB)
async def update_setting_status(
    *,
    db: AsyncSession = Depends(get_db),
    id: int,
    is_active: bool,
    request: Request,
    current_user: User = Depends(get_current_active_admin),
) -> Any:
    """
    Update active status of a setting.
    """
    setting = await crud_settings.get(db=db, id=id)
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
        
    updated_setting = await crud_settings.update_setting(
        db, 
        db_obj=setting, 
        obj_in=SettingUpdate(is_active=is_active), 
        user_id=current_user.id,
        ip_address=request.client.host if request.client else None
    )
    return updated_setting
