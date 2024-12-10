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
import { Gems } from '../gems/entities/gems.entity'

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
        const user = await User.getUser(userId)
        if (!user) throw Errors.UserNotFound

        const setting = await EventSetting.getEventSettingByKey(
            EventSettingKey.WatchVideo
        )
        if (!setting) throw Errors.EventSettingNotFound

        await this.gemsService.gemsHistory({
            userId,
            type: setting.eventSettingKey,
            gems: setting.gems,
        })

        return true
    }

    async unlockTraining(userId: string) {
        return await startTransaction(async (manager) => {
            const user = await User.getUser(userId)
            if (!user) throw Errors.UserNotFound

            const setting = await EventSetting.getEventSettingByKey(
                EventSettingKey.UnlockTraining
            )
            if (!setting) throw Errors.EventSettingNotFound
            const { eventSettingKey, gems } = setting

            const unlockPrice = (user.unlockTraining + 1) * gems
            if (user.gems < unlockPrice) {
                throw Errors.NotEnoughGems
            }
            user.unlockTraining += 1
            user.gems -= unlockPrice

            await Gems.createGems(
                {
                    userId,
                    type: eventSettingKey,
                    gems: -unlockPrice,
                },
                manager
            )

            await User.updateUser(user, manager)
            return true
        })
    }
}
