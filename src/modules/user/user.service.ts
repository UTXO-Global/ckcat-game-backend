import { Config, config } from './../../configs/index'
import { Inject, Service } from 'typedi'
import { startTransaction } from '../../database/connection'
import { User } from './entities/user.entity'
import { UserDTO } from './dtos/user.dto'
import { plainToInstance } from 'class-transformer'
import { AuthService } from '../auth/auth.service'
import { CacheKeys, CacheManager } from '../../cache'
import { getNowUtc } from '../../utils'
import { CheckIn } from '../check-in/entities/check-in.entity'
import { Gems } from '../gems/entities/gems.entity'
import { EventSettingKey } from '../event-setting/types/event-setting.type'
import { EventSetting } from '../event-setting/entities/event-setting.entity'
import { Errors } from '../../utils/error'
import { GemsService } from '../gems/gems.service'
import { ItemService } from '../item/item.service'
import { UserWallet } from '../wallet/entities/user-wallet.entity'
import { UserGetLeaderboardReqDTO } from './dtos/user-get-leaderboard.dto'

@Service()
export class UserService {
    constructor(
        @Inject() private authService: AuthService,
        @Inject() private cacheManager: CacheManager,
        @Inject() private gemsService: GemsService,
        @Inject() private itemService: ItemService,
        @Inject() private config: Config
    ) {}

    async signIn(data: UserDTO) {
        var user = await User.getUser(data.id)
        if (!user) {
            user = await startTransaction(async (manager) => {
                const user = await User.createUser(data, manager)
                return user
            })
        }

        const token = await this.authService.signToken(user.id)

        const gems = await Gems.getGemsByType(
            user.id,
            EventSettingKey.FirstLogin
        )
        if (!gems) {
            const setting = await EventSetting.getEventSettingByKey(
                EventSettingKey.FirstLogin
            )
            if (!setting) throw Errors.EventSettingNotFound

            await this.gemsService.gemsHistory({
                userId: user.id,
                type: setting.eventSettingKey,
                gems: setting.gems,
            })
        }

        const res = plainToInstance(UserDTO, user, {
            excludeExtraneousValues: true,
        })

        return {
            token,
            ...res,
        }
    }

    async refreshToken(token: string) {
        const { userId } = await this.authService.verifyRefreshToken(token)
        return await this.authService.signToken(userId)
    }

    async signOut(token: string) {
        const { userId } = await this.authService.verifyToken(token)
        await this.cacheManager.del(CacheKeys.accessToken(userId, token))
    }

    async getProfile(userId: string) {
        const user = await User.getUser(userId)
        const wallet = await UserWallet.getWalletByUserId(userId)

        const existedCheckIn = await CheckIn.getLastCheckIn(userId)
        const now = getNowUtc()
        const currentDate = new Date(now).setUTCHours(0, 0, 0, 0)

        const dailyReward = existedCheckIn ? existedCheckIn.currentStreak : 0
        const checkInDate = existedCheckIn?.checkInDate.setUTCHours(0, 0, 0, 0)

        const isCheckIn = checkInDate === currentDate

        const slot = await this.itemService.getUserSlot(user.id)
        return {
            user,
            isCheckIn,
            dailyReward,
            slot,
            walletAddress: wallet?.address || '',
            paymentAddress: config.ckbAddress,
        }
    }

    async getLeaderBoard(data: UserGetLeaderboardReqDTO) {
        const res = await User.getLeaderBoard(data)
        return res
    }
}
