import { plainToInstance } from 'class-transformer'
import { Admin } from '../entities/admin.entity'
import Container from 'typedi'
import { Errors } from '../../../utils/error'
import { AppDataSource } from '../../../database/connection'
import { CacheKeys, CacheManager, CacheTimes } from '../../../cache'
import { AdminDTO } from '../dtos/admin.dto'

export const AdminRepos = AppDataSource.getRepository(Admin).extend({
    checkStatus(admin: Admin | AdminDTO) {
        if (!admin) {
            throw Errors.AdminNotFound
        }
    },

    async getAdmin(email: string) {
        const cacheManager = Container.get(CacheManager)
        const cachedUser = await cacheManager.getObject<AdminDTO>(
            AdminDTO,
            CacheKeys.admin(email)
        )
        if (cachedUser) return cachedUser

        const res = await Admin.findOne({
            where: {
                email,
            },
        })

        if (res) {
            const admin = plainToInstance(AdminDTO, res, {
                excludeExtraneousValues: true,
            })
            await cacheManager.setObject(
                CacheKeys.admin(email),
                admin,
                CacheTimes.day(30)
            )
            return admin
        }
    },

    async getAdminById(id: string) {
        const admin = await Admin.findOne({
            where: {
                id,
            },
        })

        this.checkStatus(admin)

        return plainToInstance(AdminDTO, admin, {
            excludeExtraneousValues: true,
        })
    },
})
