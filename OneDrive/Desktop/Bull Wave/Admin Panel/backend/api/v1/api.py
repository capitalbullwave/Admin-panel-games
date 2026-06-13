from fastapi import APIRouter
from api.v1 import auth, users, kyc, admin_kyc, wallet, admin_wallet, games, results, support
from api.v1 import game_categories, game_providers, game_banners, game_settings, uploads, settings

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(kyc.router, prefix="/kyc", tags=["kyc"])
api_router.include_router(admin_kyc.router, prefix="/admin/kyc", tags=["admin_kyc"])
api_router.include_router(wallet.router, prefix="/wallet", tags=["wallet"])
api_router.include_router(admin_wallet.router, prefix="/admin/wallet", tags=["admin_wallet"])
api_router.include_router(games.router, prefix="/games", tags=["games"])
api_router.include_router(game_categories.router, prefix="/game-categories", tags=["game_categories"])
api_router.include_router(game_providers.router, prefix="/game-providers", tags=["game_providers"])
api_router.include_router(game_banners.router, prefix="/game-banners", tags=["game_banners"])
api_router.include_router(game_settings.router, prefix="/game-settings", tags=["game_settings"])
api_router.include_router(settings.router, prefix="/admin/settings", tags=["settings"])
api_router.include_router(uploads.router, prefix="/uploads", tags=["uploads"])
api_router.include_router(results.router, prefix="/results", tags=["results"])
api_router.include_router(support.router, prefix="/support", tags=["support"])
