import {
    Column,
    Entity,
    EntityManager,
    ObjectId,
    ObjectIdColumn,
} from 'typeorm'
import { AppBaseEntity } from '../../../base/base.entity'
import { CheckInDTO } from '../dtos/check-in.dto'
import { AppDataSource } from '../../../database/connection'
import { plainToInstance } from 'class-transformer'
import { getNowUtc, randomID } from '../../../utils'
import { Errors } from '../../../utils/error'

@Entity()
export class CheckIn extends AppBaseEntity {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    checkInId: string

    @Column()
    userId: string

    @Column()
    checkInDate: Date

    @Column()
    currentStreak: number

    static async createCheckIn(
        data: CheckInDTO,
        manager: EntityManager = AppDataSource.manager
    ) {
        const createFields = plainToInstance(CheckInDTO, data, {
            excludeExtraneousValues: true,
        })

        return await manager.save(
            CheckIn.create({
                ...createFields,
            })
        )
    }

    static async getLastCheckIn(userId: string) {
        const existedCheckIn = await CheckIn.findOne({
            where: { userId },
            order: { checkInDate: 'DESC' },
        })
        return existedCheckIn
    }

    static async checkIn(userId: string) {
        const now = getNowUtc()
        const currentDate = new Date(now)
        currentDate.setUTCHours(0, 0, 0, 0)

        // Validate check-in
        const checkInData = await this.getLastCheckIn(userId)

        if (checkInData) {
            const checkInDate = checkInData.checkInDate.setUTCHours(0, 0, 0, 0)
            if (checkInDate === currentDate.getTime()) {
                throw Errors.CheckInAlready
            }

            if (checkInData.currentStreak === 30) {
                throw Errors.CompletedDailyLogin
            }
        }

        const streak = checkInData ? checkInData.currentStreak + 1 : 1

        // Tạo bản ghi check-in mới
        const newCheckIn = await CheckIn.createCheckIn({
            checkInId: randomID(),
            userId,
            checkInDate: currentDate,
            currentStreak: streak,
        })

        return newCheckIn
    }
}
