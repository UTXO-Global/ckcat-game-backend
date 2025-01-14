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
import { decrypt } from '../../utils'
import { Config } from '../../configs'
import { validateOrReject } from 'class-validator'

@Service()
export class GameService {
    constructor(
        @Inject() private gemsService: GemsService,
        @Inject() private config: Config
    ) {}
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

    async getDecryptedGameData(userId: string) {
        try {
            // Fetch the game data by userId
            const game = await Game.findOne({ where: { userId } })
            if (!game) {
                throw new Error('Game not found')
            }

            // Extract the secret key and IV key
            const { secretKey, ivKey } = this.config

            // Decrypt the game data
            const decryptedData = decrypt(game.data, secretKey, ivKey)

            // Decode Base64 string to UTF-8
            const decodedData = Buffer.from(decryptedData, 'base64').toString(
                'utf8'
            )

            // Convert the decoded JSON string to a GameDTO object
            // const gameData = plainToInstance(GameDTO, JSON.parse(decodedData), {
            //     excludeExtraneousValues: true,
            // })

            // Validate the GameDTO object
            await validateOrReject(JSON.parse(decodedData))

            // Parse the decoded data
            const parsedData = JSON.parse(decodedData)
            const totalItems = parsedData?.items.length

            return { decodedData: parsedData, totalItems }
        } catch (error) {
            console.error('Error during data decryption and validation:', error)
            throw new Error('Invalid game data')
        }
    }
}
