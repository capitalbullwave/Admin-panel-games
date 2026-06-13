from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, desc
from crud.base import CRUDBase
from models.settings import Setting, SettingsAuditLog
from schemas.settings import SettingCreate, SettingUpdate

class CRUDSettings(CRUDBase[Setting, SettingCreate, SettingUpdate]):
    async def get_by_category(self, db: AsyncSession, category: str) -> List[Setting]:
        result = await db.execute(
            select(self.model).filter(self.model.category == category)
        )
        return result.scalars().all()

    async def get_by_key(self, db: AsyncSession, setting_key: str) -> Optional[Setting]:
        result = await db.execute(
            select(self.model).filter(self.model.setting_key == setting_key)
        )
        return result.scalars().first()
        
    async def get_all_categories(self, db: AsyncSession) -> List[str]:
        result = await db.execute(
            select(self.model.category).distinct()
        )
        return result.scalars().all()

    async def update_setting(
        self, db: AsyncSession, *, db_obj: Setting, obj_in: SettingUpdate, user_id: int, ip_address: Optional[str] = None
    ) -> Setting:
        old_value = db_obj.setting_value
        
        # Update setting
        db_obj.updated_by = user_id
        db_obj = await super().update(db, db_obj=db_obj, obj_in=obj_in)
        
        # Log if changed
        new_value = db_obj.setting_value
        if old_value != new_value:
            audit_log = SettingsAuditLog(
                setting_id=db_obj.id,
                old_value=old_value,
                new_value=new_value,
                changed_by=user_id,
                ip_address=ip_address
            )
            db.add(audit_log)
            await db.commit()
            
        return db_obj

    async def update_category_settings(
        self, db: AsyncSession, *, category: str, settings_in: Dict[str, Any], user_id: int, ip_address: Optional[str] = None
    ) -> List[Setting]:
        updated_settings = []
        for key, value in settings_in.items():
            setting_obj = await self.get_by_key(db, setting_key=key)
            if setting_obj and setting_obj.category == category:
                # Need to cast value to string
                str_val = str(value) if value is not None else None
                # Skip if no change
                if setting_obj.setting_value == str_val:
                    updated_settings.append(setting_obj)
                    continue
                    
                update_data = SettingUpdate(setting_value=str_val)
                updated_setting = await self.update_setting(
                    db, db_obj=setting_obj, obj_in=update_data, user_id=user_id, ip_address=ip_address
                )
                updated_settings.append(updated_setting)
            elif not setting_obj:
                # Optionally create if doesn't exist, but typically settings are seeded.
                # Here we create it dynamically if it doesn't exist.
                str_val = str(value) if value is not None else None
                new_setting = Setting(
                    category=category,
                    setting_key=key,
                    setting_value=str_val,
                    updated_by=user_id
                )
                db.add(new_setting)
                await db.commit()
                await db.refresh(new_setting)
                
                # Audit log for creation
                audit_log = SettingsAuditLog(
                    setting_id=new_setting.id,
                    old_value=None,
                    new_value=str_val,
                    changed_by=user_id,
                    ip_address=ip_address
                )
                db.add(audit_log)
                await db.commit()
                updated_settings.append(new_setting)
                
        return updated_settings

    async def get_audit_logs(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[SettingsAuditLog]:
        result = await db.execute(
            select(SettingsAuditLog)
            .order_by(desc(SettingsAuditLog.created_at))
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

settings = CRUDSettings(Setting)
