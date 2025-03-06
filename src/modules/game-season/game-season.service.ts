import { GameSeasionGetDTO } from './dtos/game-season-get.dto'
import { GameSeason } from './entities/game-season.entity'
import { Service } from 'typedi'

@Service()
export class GameSeasonService {
    async getGameSeasons(data: GameSeasionGetDTO) {
        return await GameSeason.getGameSeason(data.dateTime)
    }
}
