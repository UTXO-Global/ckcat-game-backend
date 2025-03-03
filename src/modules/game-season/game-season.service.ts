import { GameSeason } from './entities/game-season.entity'
import { Service } from 'typedi'

@Service()
export class GameSeasonService {
    async getGameSeasons() {
        return await GameSeason.getGameSeason()
    }
}
