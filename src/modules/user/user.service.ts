import { Inject, Service } from 'typedi'
import { startTransaction } from '../../database/connection'
import { User } from './entities/user.entity'
import { UserDTO } from './dtos/user.dto'
import { plainToInstance } from 'class-transformer'
import { AuthService } from '../auth/auth.service'
import { CacheKeys, CacheManager } from '../../cache'
import { Gems } from '../gems/entities/gems.entity'
import { EventSettingKey } from '../event-setting/types/event-setting.type'
import { EventSetting } from '../event-setting/entities/event-setting.entity'
import { Errors } from '../../utils/error'
import { GemsService } from '../gems/gems.service'

@Service()
export class UserService {
    constructor(
        @Inject() private authService: AuthService,
        @Inject() private cacheManager: CacheManager,
        @Inject() private gemsService: GemsService
    ) {}

    async signIn(data: UserDTO) {
        var user = await User.getUser(data.id)
        if (!user) {
            user = await startTransaction(async (manager) => {
                const user = await User.createUser(data, manager)
                return user
            })
        }

        const token = await this.authService.signToken(
            user.id,
        )

        const gems = await Gems.getGemsByType(user.id, EventSettingKey.FirstLogin);
        if(!gems) {
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
        const { userId } = await this.authService.verifyRefreshToken(
            token
        )
        return await this.authService.signToken(
            userId,
        );
    }

    async signOut(token: string) {
        const { userId } = await this.authService.verifyToken(
            token
        )
        await this.cacheManager.del(CacheKeys.accessToken(userId, token))
    }

    async getProfile(userId: string) {
        return await User.getUser(userId)
    }
}
