import { AuthService } from './../../auth/auth.service'
import {
    Column,
    Entity,
    EntityManager,
    ObjectId,
    ObjectIdColumn,
} from 'typeorm'
import { AppBaseEntity } from '../../../base/base.entity'
import { AppDataSource } from '../../../database/connection'
import { plainToInstance } from 'class-transformer'
import { GemsDTO } from '../dtos/gems.dto'
import { GemsConvertDTO } from '../dtos/gems-convert.dto'
import { UserDTO } from '../../user/dtos/user.dto'
import { User } from '../../user/entities/user.entity'
import { Errors } from '../../../utils/error'
import { GemsType } from '../types/gems.type'
import Container from 'typedi'

@Entity()
export class Gems extends AppBaseEntity {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    userId: string

    @Column()
    type: string

    @Column()
    gems: number

    static async createGems(
        data: GemsDTO,
        manager: EntityManager = AppDataSource.manager
    ) {
        const createFields = plainToInstance(GemsDTO, data, {
            excludeExtraneousValues: true,
        })

        return await manager.save(
            Gems.create({
                ...createFields,
            })
        )
    }

    static async getGemsByType(userId: string, type: string) {
        return await Gems.findOne({
            where: {
                userId,
                type,
            },
        })
    }

    static async convertGems(
        data: GemsConvertDTO,
        manager: EntityManager = AppDataSource.manager
    ) {
        const { initData, convertAddress, gems } = data

        const authService = Container.get(AuthService)
        const verifyData = await authService.verifyInitData(initData)
        if (!verifyData) {
            throw Errors.Unauthorized
        }

        const params = new URLSearchParams(initData)
        const obj: Record<string, string> = {}
        for (const [key, value] of params.entries()) {
            obj[key] = value
        }

        const userObject = JSON.parse(obj.user)
        const userId = userObject.id.toString()
        const user = plainToInstance(
            UserDTO,
            {
                id: userId,
                firstName: userObject.first_name,
                lastName: userObject.last_name,
                gems: 0,
            },
            { excludeExtraneousValues: true }
        )

        let userProfile = await User.findOne({ where: { id: user.id } })

        if (!userProfile) {
            user.convertAddress = convertAddress
            userProfile = await User.createUser(user, manager)
        }

        if (!userProfile.convertAddress) {
            userProfile.convertAddress = convertAddress
            await User.updateUser(userProfile, manager)
        }

        if (userProfile.convertAddress !== convertAddress) {
            throw Errors.ConvertAddressNotMatch
        }

        userProfile.gems += gems

        await Gems.createGems(
            {
                userId: userProfile.id,
                type: GemsType.ConvertPointToGems,
                gems,
            },
            manager
        )

        await User.updateUser(userProfile, manager)
        return true
    }
}
