import {
    Column,
    Entity,
    EntityManager,
    Index,
    ObjectIdColumn,
    PrimaryGeneratedColumn,
} from 'typeorm'
import { ObjectId } from 'bson'
import { AppBaseEntity } from '../../../base/base.entity'
import { AppDataSource } from '../../../database/connection'
import { UserDTO } from '../dtos/user.dto'
import { plainToInstance } from 'class-transformer'
import { Errors } from '../../../utils/error'
import { ResponseWrapper } from '../../../utils/response'
import Container from 'typedi'
import { CacheKeys, CacheManager, CacheTimes } from '../../../caches'
import { LeaderBoardDTO } from '../dtos/leader-board.dto'

@Entity()
export class User extends AppBaseEntity {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    id: string

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    username: string

    @Column()
    coin: number

    @Index()
    @Column({ length: 6 })
    salt: string

    static async createUser(
        data: UserDTO,
        manager: EntityManager = AppDataSource.manager
    ) {
        await this.validateUserInfo({ id: data.id })
        const createFields = plainToInstance(UserDTO, data, {
            excludeExtraneousValues: true,
        })

        const user = await manager.save(
            User.create({
                ...createFields,
            })
        )
        if (createFields) {
            const cacheManager = Container.get(CacheManager)
            const catchUser = plainToInstance(UserDTO, user, {
                excludeExtraneousValues: true,
            })
            await cacheManager.setObject(
                CacheKeys.user(catchUser.id),
                catchUser,
                CacheTimes.day(30)
            )
            await cacheManager.zAdd(CacheKeys.leaderBoard(), user.id, user.coin)
        }
        return user
    }

    static async getUser(id: string) {
        const cacheManager = Container.get(CacheManager)
        const cachedUser = await cacheManager.getObject<UserDTO>(
            CacheKeys.user(id)
        )
        if (cachedUser) return cachedUser

        const res = await User.findOne({
            where: {
                id: id,
            },
        })

        if (res) {
            const user = plainToInstance(UserDTO, res, {
                excludeExtraneousValues: true,
            })
            await cacheManager.setObject(
                CacheKeys.user(id),
                user,
                CacheTimes.day(30)
            )
            return user
        }
    }


    static async validateUserInfo(data: { id?: string }) {
        const { id } = data
        if (id) {
            const existedEmail = await User.findOne({
                where: {
                    id,
                },
            })
            if (existedEmail) {
                throw Errors.UserIdExisted
            }
        } else {
            throw Errors.UserIdExisted
        }
    }
    
}
