import { Inject, Service } from 'typedi'
import { Config } from '../../configs'
import { CacheManager } from '../../caches'
import { startTransaction } from '../../database/connection'
import { GameDTO } from './dtos/game.dto'
import { Game } from './entities/game.entity'
import { plainToInstance } from 'class-transformer'

@Service()
export class GameService {

    async createGame(data: GameDTO) {
        return await startTransaction(async (manager) => {
            return await Game.createGame(plainToInstance(GameDTO, data), manager)
        })
    }

    async getGameInfo(userId: string) {
        return await Game.getGame(userId)
    }
}
