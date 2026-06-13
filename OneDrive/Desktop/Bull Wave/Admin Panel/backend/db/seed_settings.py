import json
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.settings import Setting, SettingsAuditLog

logger = logging.getLogger(__name__)

DEFAULT_SETTINGS = {
    "General Settings": {
        "Platform Name": "Bull Wave Capital",
        "Company Name": "Bull Wave Capital Pvt Ltd",
        "Support Email": "support@bullwavecapital.com",
        "Support Phone": "+91 9876543210",
        "Timezone": "Asia/Kolkata",
        "Currency": "INR",
        "Language": "English",
        "Date Format": "DD/MM/YYYY",
        "Platform Logo": "",
        "Favicon": ""
    },
    "Referral Settings": {
        "Referral Enable": "true",
        "Referral Signup Bonus": "100",
        "Level 1 Commission": "10",
        "Level 2 Commission": "5",
        "Level 3 Commission": "2",
        "Max Referral Earnings": "50000",
        "Referral Withdrawal Rules": ""
    },
    "KYC Settings": {
        "KYC Mandatory": "true",
        "PAN Verification Required": "true",
        "Aadhaar Verification Required": "true",
        "Bank Verification Required": "true",
        "Auto Approval": "false",
        "KYC Expiry Days": "365"
    },
    "Wallet Settings": {
        "Minimum Deposit": "100",
        "Maximum Deposit": "500000",
        "Minimum Withdrawal": "200",
        "Maximum Withdrawal": "100000",
        "Daily Withdrawal Limit": "200000",
        "Withdrawal Fee": "10",
        "Wallet Bonus Expiry": "30"
    },
    "Payment Settings": {
        "Razorpay": json.dumps({"enabled": True, "merchant_id": "", "api_key": "", "secret_key": ""}),
        "Cashfree": json.dumps({"enabled": False, "merchant_id": "", "api_key": "", "secret_key": ""}),
        "PhonePe": json.dumps({"enabled": False, "merchant_id": "", "api_key": "", "secret_key": ""}),
        "Paytm": json.dumps({"enabled": False, "merchant_id": "", "api_key": "", "secret_key": ""})
    },
    "Bonus Settings": {
        "Signup Bonus": "50",
        "First Deposit Bonus": "100",
        "Daily Login Bonus": "5",
        "Cashback Percentage": "2",
        "Welcome Bonus": "100"
    },
    "Game Settings": {
        "Enable Games": "true",
        "Minimum Bet Amount": "10",
        "Maximum Bet Amount": "10000",
        "Result Delay": "5",
        "Auto Settlement": "true",
        "Default Game Visibility": "true"
    },
    "Security Settings": {
        "Login Attempt Limit": "5",
        "Account Lock Duration": "30",
        "Password Length": "8",
        "Session Timeout": "60",
        "Enable 2FA": "false",
        "Device Verification": "true",
        "IP Whitelist": ""
    },
    "Notification Settings": {
        "Email Notifications": "true",
        "SMS Notifications": "true",
        "Push Notifications": "true",
        "Telegram Alerts": "false",
        "Admin Alerts": "true"
    },
    "Registration Settings": {
        "Registration Enabled": "true",
        "Mobile Verification": "true",
        "Email Verification": "false",
        "Invite Code Required": "false",
        "Age Restriction": "18"
    },
    "Support Settings": {
        "WhatsApp Number": "+91 9876543210",
        "Telegram URL": "",
        "Support Email": "support@bullwavecapital.com",
        "Ticket System": "true",
        "Live Chat Enable": "true"
    },
    "Tax & Compliance": {
        "GST Percentage": "18",
        "TDS Percentage": "30",
        "PAN Mandatory Threshold": "10000",
        "Withdrawal Tax Rules": ""
    },
    "System Configuration": {
        "Frontend URL": "https://app.bullwavecapital.com",
        "Admin URL": "https://admin.bullwavecapital.com",
        "API URL": "https://api.bullwavecapital.com",
        "CDN URL": "",
        "Storage Provider": "local",
        "Backup Schedule": "Daily"
    },
    "Maintenance Settings": {
        "Maintenance Mode": "false",
        "Maintenance Message": "Platform is under maintenance. Please try again later.",
        "Start Time": "",
        "End Time": "",
        "Allowed Admin IPs": ""
    }
}

from models.user import User

async def seed_default_settings(db: AsyncSession):
    """
    Seeds default settings into the database.
    Skips if category + key already exists.
    """
    logger.info("Starting default settings seeding...")
    
    try:
        # Get a valid user ID for audit logs
        user_result = await db.execute(select(User).limit(1))
        first_user = user_result.scalars().first()
        
        if not first_user:
            logger.info("No users found. Creating a System Admin user to allow settings seeding...")
            system_user = User(
                name="System Admin",
                email="system@bullwavecapital.com",
                mobile="0000000000",
                username="system_admin",
                status="Active"
            )
            db.add(system_user)
            await db.commit()
            await db.refresh(system_user)
            user_id = system_user.id
        else:
            user_id = first_user.id
        
        # Get all existing setting keys
        result = await db.execute(select(Setting.setting_key))
        existing_keys = set(result.scalars().all())
        
        changes_made = False
        
        for category, keys in DEFAULT_SETTINGS.items():
            for key, value in keys.items():
                if key not in existing_keys:
                    new_setting = Setting(
                        category=category,
                        setting_key=key,
                        setting_value=value,
                        updated_by=user_id
                    )
                    db.add(new_setting)
                    await db.commit()
                    await db.refresh(new_setting)
                    
                    # Add Audit Log
                    audit_log = SettingsAuditLog(
                        setting_id=new_setting.id,
                        old_value=None,
                        new_value=value,
                        changed_by=user_id,
                        ip_address="127.0.0.1"
                    )
                    db.add(audit_log)
                    await db.commit()
                    changes_made = True
                    
        if changes_made:
            logger.info("Successfully seeded new default settings.")
        else:
            logger.info("No new settings to seed.")
            
    except Exception as e:
        await db.rollback()
        logger.error(f"Error during settings seeding: {e}")
