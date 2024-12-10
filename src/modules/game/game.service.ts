import { Inject, Service } from 'typedi'
import { startTransaction } from '../../database/connection'
import { GameDTO } from './dtos/game.dto'
import { Game } from './entities/game.entity'
import { plainToInstance } from 'class-transformer'
import { User } from '../user/entities/user.entity'
import { Errors } from '../../utils/error'
import { GemsService } from '../gems/gems.service'
import { EventSetting } from '../event-setting/entities/event-setting.entity'
import { EventSettingKey } from '../event-setting/types/event-setting.type'

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

    async claimWatchVideo(userId: string) {
        return await startTransaction(async (manager) => {
            const user = await manager.findOneBy(User, { id: userId })
            if (!user) throw Errors.UserNotFound

            const setting = await EventSetting.getEventSettingByKey(
                EventSettingKey.WatchVideo
            )

            await this.gemsService.gemsHistory({
                userId,
                type: setting.eventSettingKey,
                gems: setting.gems,
            })

            return true
        })
    }
}
