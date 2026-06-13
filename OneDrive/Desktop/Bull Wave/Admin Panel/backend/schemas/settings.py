from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class SettingBase(BaseModel):
    category: str
    setting_key: str
    setting_value: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True

class SettingCreate(SettingBase):
    pass

class SettingUpdate(BaseModel):
    setting_value: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class SettingInDB(SettingBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    updated_by: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

class SettingsCategoryUpdate(BaseModel):
    settings: Dict[str, Any]

class SettingsAuditLogBase(BaseModel):
    setting_id: int
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    changed_by: int
    ip_address: Optional[str] = None

class SettingsAuditLogInDB(SettingsAuditLogBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
