from crud.base import CRUDBase
from models.game_categories import GameCategory
from schemas.game_categories import GameCategoryCreate, GameCategoryUpdate

class CRUDGameCategory(CRUDBase[GameCategory, GameCategoryCreate, GameCategoryUpdate]):
    pass

game_category = CRUDGameCategory(GameCategory)
