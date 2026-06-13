import json
from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from db.session import SessionLocal
from crud.crud_settings import settings as crud_settings
import logging

logger = logging.getLogger(__name__)

class MaintenanceMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Exclude admin routes, docs, and static files
        path = request.url.path
        if (
            path.startswith("/api/v1/admin") 
            or path.startswith("/docs") 
            or path.startswith("/openapi.json")
            or path.startswith("/static")
            or path.startswith("/api/v1/games")
            or path.startswith("/api/v1/game-categories")
            or path.startswith("/api/v1/game-providers")
            or path.startswith("/api/v1/game-banners")
            or path.startswith("/api/v1/game-settings")
            or path.startswith("/api/v1/auth")
            or path.startswith("/api/v1/uploads")
            or path.startswith("/api/v1/users")
            or path.startswith("/api/v1/results")
            or path.startswith("/api/v1/support")
        ):
            return await call_next(request)

        # For user APIs, check maintenance status
        try:
            async with SessionLocal() as db:
                maintenance_setting = await crud_settings.get_by_key(db, setting_key="Maintenance Mode")
                if maintenance_setting and maintenance_setting.setting_value == "true":
                    # Check allowed IPs if needed
                    client_ip = request.client.host if request.client else ""
                    allowed_ips_setting = await crud_settings.get_by_key(db, setting_key="Allowed Admin IPs")
                    allowed_ips = []
                    if allowed_ips_setting and allowed_ips_setting.setting_value:
                        allowed_ips = [ip.strip() for ip in allowed_ips_setting.setting_value.split(',')]
                        
                    if client_ip not in allowed_ips:
                        message_setting = await crud_settings.get_by_key(db, setting_key="Maintenance Message")
                        message = message_setting.setting_value if message_setting and message_setting.setting_value else "System is under maintenance. Please try again later."
                        
                        return JSONResponse(
                            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                            content={"detail": message, "maintenance": True}
                        )
        except Exception as e:
            logger.error(f"Error in maintenance middleware: {e}")
            
        return await call_next(request)
