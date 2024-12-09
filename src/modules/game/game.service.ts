import { Inject, Service } from 'typedi'
import { startTransaction } from '../../database/connection'
import { GameDTO } from './dtos/game.dto'
import { Game } from './entities/game.entity'
import { plainToInstance } from 'class-transformer'
import { User } from '../user/entities/user.entity'
import { Errors } from '../../utils/error'
import { GemsService } from '../gems/gems.service'

@Service()
export class GameService {
    constructor(@Inject() private gemsService: GemsService) {}
    async createGame(data: GameDTO) {
        return await startTransaction(async (manager) => {
            return await Game.createGame(
                plainToInstance(GameDTO, data),
                manager
            )
        })
    }

    async getGameInfo(userId: string) {
        return await Game.getGame(userId)
    }

    async confirmWatchVideo(userId: string) {
        return await startTransaction(async (manager) => {
            const user = await manager.findOneBy(User, { id: userId })
            if (!user) throw Errors.UserNotFound

            await this.gemsService.gemsHistory({
                userId,
                type: 'watch-video',
                gems: 50,
            })

            return true
        })
    }
}
