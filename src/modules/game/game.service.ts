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
import { Config } from '../../configs'
import { GameReward } from './entities/game-reward.entity'
import { CacheKeys, CacheManager } from '../../cache'
import { UserGameAttributes } from '../user/entities/user-game-attributes.entity'

@Service()
export class GameService {
    constructor(
        @Inject() private gemsService: GemsService,
        @Inject() private config: Config,
        @Inject() private cacheManager: CacheManager
    ) {}
    async createGame(data: GameDTO) {
        return await startTransaction(async (manager) => {
            const decrypted = await this.decryptedGameData(data.data)
            const items = decrypted?.parsedData?.items || []

            const itemMap: Record<string, any> = {}
            items.forEach((item) => {
                itemMap[item.key] = item
            })

            const {
                UserID: userItem,
                LevelMonster: levelBossItem,
                MoneyCoins: soulItem,
                BeastHigest: catHighestItem,
            } = itemMap

            if (!userItem || userItem.valueString !== data.userId) {
                throw Errors.UserNotMatch
            }

            // check level boss to process reward
            const nextLevel = levelBossItem?.valueInt ?? 0

            if (
                levelBossItem &&
                this.config.conditionReward.includes(nextLevel)
            ) {
                await GameReward.createGameReward(
                    { userId: data.userId, level: nextLevel },
                    manager
                )
            }

            await Promise.all([
                this.cacheManager.zAdd(
                    CacheKeys.leaderBoard(),
                    data.userId,
                    nextLevel
                ),
                UserGameAttributes.createAttributes({
                    userId: data.userId,
                    amountBossKill: nextLevel,
                    soul: Number(soulItem?.valueString ?? 0),
                    catHighest: catHighestItem?.valueInt ?? 0,
                }),
            ])

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

    async claimWatchAds(userId: string) {
        const user = await User.getUser(userId)
        if (!user) throw Errors.UserNotFound

        const setting = await EventSetting.getEventSettingByKey(
            EventSettingKey.WatchAds
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

    private async decryptedGameData(data: string) {
        return await Game.decryptedGameData(data)
    }
}
