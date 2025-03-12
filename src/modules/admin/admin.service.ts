import { Inject, Service } from 'typedi'
import { AdminLogInReqDTO } from './dtos/admin-log-in.dto'
import { AdminRepos } from './repos/admin.repos'
import bcrypt from 'bcrypt'
import { Errors } from '../../utils/error'
import { AuthAdminService } from './auth/auth-admin.service'
import { AdminLogOutReqDTO } from './dtos/admin-log-out.dto'
import { logger } from '../../utils/logger'
import { AdminRefreshTokenReqDTO } from './dtos/admin-refresh-token.dto'
import { AuthCMSReqDTO } from '../../base/base.dto'
import { AdminDTO } from './dtos/admin.dto'
import { AppDataSource } from '../../database/connection'
import { Admin } from './entities/admin.entity'
import { randomID } from '../../utils'

@Service()
export class AdminService {
    constructor(@Inject() private authAdminService: AuthAdminService) {}

    async login(data: AdminLogInReqDTO) {
        const { email, password } = data

        const admin = await AdminRepos.getAdmin(email)
        AdminRepos.checkStatus(admin)

        const isValidPassword = bcrypt.compareSync(password, admin.password)
        if (!isValidPassword) {
            throw Errors.InvalidAccount
        }

        // generate auth tokens
        const { accessToken, refreshToken } =
            await this.authAdminService.generateAuthTokenPairs(
                {
                    email: email,
                },
                admin.salt
            )

        return {
            ...admin,
            accessToken,
            refreshToken,
        }
    }

    async logOut(data: AdminLogOutReqDTO) {
        const { accessToken } = data
        try {
            await this.authAdminService.revokeAccessToken(accessToken)
        } catch (error) {
            logger.error('failed to logout', error)
        }
    }

    async refreshToken(data: AdminRefreshTokenReqDTO) {
        const { token } = data
        const authPayload = await this.authAdminService.verifyRefreshToken(
            token
        )

        const admin = await AdminRepos.getAdmin(authPayload.email)
        if (!admin) throw Errors.UserNotFound

        await this.authAdminService.revokeRefreshToken(token)

        const { accessToken, refreshToken } =
            await this.authAdminService.generateAuthTokenPairs(
                {
                    email: admin.email,
                },
                admin.salt
            )

        return { accessToken, refreshToken }
    }

    async getProfile(data: AuthCMSReqDTO) {
        const profile = await AdminRepos.getAdmin(data.email)
        profile.hideSensitiveData()
        return profile
    }

    async createAdmin(data: AdminDTO) {
        const { id, email, password } = data

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        const repos = AppDataSource.getMongoRepository(Admin)
        const admin = repos.create({
            id: randomID(),
            email,
            password: hashedPassword,
            salt: '',
        })

        return await repos.save(admin)
    }
}
