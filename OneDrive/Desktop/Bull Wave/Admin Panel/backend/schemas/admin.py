from typing import Optional
from pydantic import BaseModel, EmailStr

class AdminBase(BaseModel):
    email: EmailStr
    username: Optional[str] = None
    mobile: Optional[str] = None
    is_active: Optional[bool] = True
    role_id: Optional[int] = None
    avatar_url: Optional[str] = None

class AdminCreate(AdminBase):
    password: str

class AdminUpdate(AdminBase):
    password: Optional[str] = None

class AdminUpdateProfile(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None
    avatar_url: Optional[str] = None
    remove_avatar: Optional[bool] = False

class AdminInDBBase(AdminBase):
    id: int
    is_2fa_enabled: Optional[bool] = False

    class Config:
        from_attributes = True

class Admin(AdminInDBBase):
    pass

class ChangePassword(BaseModel):
    current_password: str
    new_password: str

class TwoFactorSetup(BaseModel):
    secret: str
    uri: str

class TwoFactorVerify(BaseModel):
    code: str
