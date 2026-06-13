from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Body, Depends, HTTPException, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
import pyotp

import crud.crud_admin as crud_admin
from api import deps
from core.config import settings
from core.security import create_access_token, verify_password, get_password_hash
from schemas.token import Token
from schemas.admin import Admin, AdminCreate, ChangePassword, TwoFactorSetup, TwoFactorVerify, AdminUpdateProfile

router = APIRouter()

@router.post("/login", response_model=Token)
async def login_access_token(
    db: AsyncSession = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
    totp_code: str = Form(None)
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    admin = await crud_admin.authenticate(
        db, email=form_data.username, password=form_data.password
    )
    if not admin:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not admin.is_active:
        raise HTTPException(status_code=400, detail="Inactive admin")
        
    if admin.is_2fa_enabled:
        if not totp_code:
            raise HTTPException(status_code=401, detail="2FA_REQUIRED")
        totp = pyotp.TOTP(admin.totp_secret)
        if not totp.verify(totp_code):
            raise HTTPException(status_code=400, detail="Invalid 2FA code")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            admin.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/register", response_model=Admin)
async def register_admin(
    *,
    db: AsyncSession = Depends(deps.get_db),
    admin_in: AdminCreate,
) -> Any:
    """
    Create a new admin user.
    """
    admin = await crud_admin.get_by_email(db, email=admin_in.email)
    if admin:
        raise HTTPException(
            status_code=400,
            detail="The admin with this email already exists in the system.",
        )
    admin = await crud_admin.create(db, obj_in=admin_in)
    return admin

@router.get("/me", response_model=Admin)
async def read_admin_me(
    current_admin: Admin = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Get current admin.
    """
    return current_admin

@router.put("/me", response_model=Admin)
async def update_admin_me(
    *,
    db: AsyncSession = Depends(deps.get_db),
    admin_in: AdminUpdateProfile,
    current_admin: Admin = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Update own user.
    """
    if admin_in.email is not None:
        # Check if email is already taken
        existing_admin = await crud_admin.get_by_email(db, email=admin_in.email)
        if existing_admin and existing_admin.id != current_admin.id:
            raise HTTPException(status_code=400, detail="Email already registered")
        current_admin.email = admin_in.email
    if admin_in.username is not None:
        current_admin.username = admin_in.username
    if admin_in.mobile is not None:
        current_admin.mobile = admin_in.mobile
    if getattr(admin_in, 'remove_avatar', False):
        current_admin.avatar_url = None
    elif admin_in.avatar_url is not None:
        current_admin.avatar_url = admin_in.avatar_url
        
    db.add(current_admin)
    await db.commit()
    await db.refresh(current_admin)
    return current_admin

@router.post("/change-password")
async def change_password(
    data: ChangePassword,
    db: AsyncSession = Depends(deps.get_db),
    current_admin: Admin = Depends(deps.get_current_active_admin),
) -> Any:
    if not verify_password(data.current_password, current_admin.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    current_admin.hashed_password = get_password_hash(data.new_password)
    db.add(current_admin)
    await db.commit()
    return {"message": "Password updated successfully"}

@router.post("/2fa/setup", response_model=TwoFactorSetup)
async def setup_2fa(
    db: AsyncSession = Depends(deps.get_db),
    current_admin: Admin = Depends(deps.get_current_active_admin),
) -> Any:
    if current_admin.is_2fa_enabled:
        raise HTTPException(status_code=400, detail="2FA is already enabled")
        
    secret = pyotp.random_base32()
    current_admin.totp_secret = secret
    db.add(current_admin)
    await db.commit()
    
    uri = pyotp.totp.TOTP(secret).provisioning_uri(
        name=current_admin.email, issuer_name=settings.PROJECT_NAME
    )
    return {"secret": secret, "uri": uri}

@router.post("/2fa/verify")
async def verify_2fa(
    data: TwoFactorVerify,
    db: AsyncSession = Depends(deps.get_db),
    current_admin: Admin = Depends(deps.get_current_active_admin),
) -> Any:
    if current_admin.is_2fa_enabled:
        raise HTTPException(status_code=400, detail="2FA is already enabled")
    if not current_admin.totp_secret:
        raise HTTPException(status_code=400, detail="2FA setup not initiated")
        
    totp = pyotp.TOTP(current_admin.totp_secret)
    if not totp.verify(data.code):
        raise HTTPException(status_code=400, detail="Invalid 2FA code")
        
    current_admin.is_2fa_enabled = True
    db.add(current_admin)
    await db.commit()
    return {"message": "2FA enabled successfully"}

@router.post("/2fa/disable")
async def disable_2fa(
    data: TwoFactorVerify,
    db: AsyncSession = Depends(deps.get_db),
    current_admin: Admin = Depends(deps.get_current_active_admin),
) -> Any:
    if not current_admin.is_2fa_enabled:
        raise HTTPException(status_code=400, detail="2FA is not enabled")
        
    totp = pyotp.TOTP(current_admin.totp_secret)
    if not totp.verify(data.code):
        raise HTTPException(status_code=400, detail="Invalid 2FA code")
        
    current_admin.is_2fa_enabled = False
    current_admin.totp_secret = None
    db.add(current_admin)
    await db.commit()
    return {"message": "2FA disabled successfully"}
