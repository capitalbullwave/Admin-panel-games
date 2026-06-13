from crud.base import CRUDBase
from models.game_providers import GameProvider
from schemas.game_providers import GameProviderCreate, GameProviderUpdate

class CRUDGameProvider(CRUDBase[GameProvider, GameProviderCreate, GameProviderUpdate]):
    pass

game_provider = CRUDGameProvider(GameProvider)
