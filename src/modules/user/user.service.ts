import { Inject, Service } from 'typedi'
import { startTransaction } from '../../database/connection'
import { User } from './entities/user.entity'
import { UserDTO } from './dtos/user.dto'
import { plainToInstance } from 'class-transformer'
import { AuthService } from '../auth/auth.service'
import { CacheKeys, CacheManager } from '../../cache'
import { getNowUtc } from '../../utils'
import { CheckIn } from '../check-in/entities/check-in.entity'

@Service()
export class UserService {
    constructor(
        @Inject() private authService: AuthService,
        @Inject() private cacheManager: CacheManager
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
        const now = getNowUtc()
        const currentDate = new Date(now)
        currentDate.setUTCHours(0, 0, 0, 0)

        const existedCheckIn = await CheckIn.findOne({
            where: {
                userId,
                checkInDate: currentDate,
            },
        })
        let isCheckIn = false
        if (existedCheckIn) {
            isCheckIn = true
        }

        return {
            user,
            isCheckIn,
        }
    }
}
