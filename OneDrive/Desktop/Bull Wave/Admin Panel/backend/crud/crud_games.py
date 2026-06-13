from crud.base import CRUDBase
from models.games import Game
from schemas.games import GameCreate, GameUpdate

class CRUDGame(CRUDBase[Game, GameCreate, GameUpdate]):
    pass

game = CRUDGame(Game)
