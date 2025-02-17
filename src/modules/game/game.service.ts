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
import { level } from 'winston'
import { UserGameAttributes } from '../user/entities/user-game-attributes.entity'

@Service()
export class GameService {
    constructor(
        @Inject() private gemsService: GemsService,
        @Inject() private config: Config,
        @Inject() private cacheManager: CacheManager
    ) {}
    // async createGame(data: GameDTO) {
    //     return await startTransaction(async (manager) => {
    //         const decrypted = await this.decryptedGameData(data.data)
    //         const userItem = decrypted?.parsedData?.items?.find(
    //             (item) => item?.key === 'UserID'
    //         )
    //         const levelBossItem = decrypted?.parsedData?.items?.find(
    //             (item) => item?.key === 'LevelMonster'
    //         )
    //         const soulItem = decrypted?.parsedData?.items?.find(
    //             (item) => item?.key === 'MoneyCoins'
    //         )
    //         const catHighestItem = decrypted?.parsedData?.items?.find(
    //             (item) => item?.key === 'BeastHigest'
    //         )

    //         if (!userItem || userItem.valueString !== data.userId) {
    //             throw Errors.UserNotMatch
    //         }

    //         //Check level boss
    //         if (
    //             levelBossItem &&
    //             this.config.conditionReward.includes(levelBossItem.valueInt + 1)
    //         ) {
    //             await GameReward.createGameReward(
    //                 {
    //                     userId: data.userId,
    //                     level: levelBossItem.valueInt + 1,
    //                 },
    //                 manager
    //             )
    //         }

    //         await this.cacheManager.zAdd(
    //             CacheKeys.leaderBoard(),
    //             data.userId,
    //             (levelBossItem?.valueInt ?? -1) + 1
    //         )

    //         await UserGameAttributes.createAttributes({
    //             userId: data.userId,
    //             amountBossKill: (levelBossItem?.valueInt ?? -1) + 1,
    //             soul: Number(soulItem?.valueString ?? 0),
    //             catHighest: catHighestItem?.valueInt ?? 0,
    //         })

    //         return await Game.createGame(
    //             plainToInstance(GameDTO, data),
    //             manager
    //         )
    //     })
    // }

    async createGame(data: GameDTO) {
        return await startTransaction(async (manager) => {
            const decrypted = await this.decryptedGameData(data.data)
            const items = decrypted?.parsedData?.items || []

            const itemMap = items.reduce((acc, item) => {
                acc[item.key] = item
                return acc
            }, {} as Record<string, any>)

            const userItem = itemMap['UserID']
            const levelBossItem = itemMap['LevelMonster']
            const soulItem = itemMap['MoneyCoins']
            const catHighestItem = itemMap['BeastHigest']

            if (!userItem || userItem.valueString !== data.userId) {
                throw Errors.UserNotMatch
            }

            // Kiểm tra level boss và xử lý phần thưởng
            if (
                levelBossItem &&
                this.config.conditionReward.includes(levelBossItem.valueInt + 1)
            ) {
                await GameReward.createGameReward(
                    {
                        userId: data.userId,
                        level: levelBossItem.valueInt + 1,
                    },
                    manager
                )
            }

            await this.cacheManager.zAdd(
                CacheKeys.leaderBoard(),
                data.userId,
                (levelBossItem?.valueInt ?? -1) + 1
            )

            await UserGameAttributes.createAttributes({
                userId: data.userId,
                amountBossKill: (levelBossItem?.valueInt ?? -1) + 1,
                soul: Number(soulItem?.valueString ?? 0),
                catHighest: catHighestItem?.valueInt ?? 0,
            })

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

    async getData(userId: string) {
        const game = await Game.getGame(userId)
        if (!game) throw Errors.GameNotFound

        const decryptData = await this.decryptedGameData(game.data)
        return { userId, bossCount: decryptData }
    }
}
