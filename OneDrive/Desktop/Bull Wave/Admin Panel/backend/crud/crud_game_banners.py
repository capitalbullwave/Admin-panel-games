from crud.base import CRUDBase
from models.game_banners import GameBanner
from schemas.game_banners import GameBannerCreate, GameBannerUpdate

class CRUDGameBanner(CRUDBase[GameBanner, GameBannerCreate, GameBannerUpdate]):
    pass

game_banner = CRUDGameBanner(GameBanner)
