import { Service } from 'typedi'
import { startTransaction } from '../../database/connection'
import { GameDTO } from './dtos/game.dto'
import { Game } from './entities/game.entity'
import { plainToInstance } from 'class-transformer'
import { User } from '../user/entities/user.entity'
import { Errors } from '../../utils/error'
import { Gems } from '../gems/entities/gems.entity'

@Service()
export class GameService {
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

    async unlockTraining(userId: string) {
        return await startTransaction(async (manager) => {
            const user = await manager.findOneBy(User, { id: userId })
            if (!user) throw Errors.UserNotFound

            if (user.gems < 50) {
                Errors.NotEnoughGems
            }

            const unlockPrice = (user.unlockTraining + 1) * 50

            user.unlockTraining += 1
            user.gems -= unlockPrice

            await Gems.createGems(
                {
                    userId,
                    type: 'unlock-training',
                    gems: -unlockPrice,
                },
                manager
            )

            await User.updateUser(user, manager)
            return true
        })
    }
}
