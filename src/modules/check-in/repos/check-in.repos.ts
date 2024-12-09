import { AppDataSource } from '../../../database/connection'
import { CheckIn } from '../entities/check-in.entity'
import { Errors } from '../../../utils/error'
import { getNowUtc, randomID } from '../../../utils'

export const CheckInRepos = AppDataSource.getMongoRepository(CheckIn).extend({
    async checkIn(userId: string) {
        const now = getNowUtc()
        const currentDate = new Date(now)
        currentDate.setUTCHours(0, 0, 0, 0)

        // Validate check-in
        const checkInData = await this.findOne({
            where: { userId },
            order: { checkInDate: 'DESC' },
        })
        if (checkInData) {
            const checkInDate = checkInData.checkInDate.setUTCHours(0, 0, 0, 0)

            if (checkInDate === currentDate.getTime()) {
                throw Errors.CheckInAlready
            }

            if (checkInData.currentStreak === 30) {
                throw Errors.CompletedRewardLogin
            }
        }

        const streak = checkInData ? checkInData.currentStreak + 1 : 1

        // Tạo bản ghi check-in mới
        const newCheckIn = CheckIn.create({
            checkInId: randomID(),
            userId,
            checkInDate: currentDate,
            currentStreak: streak,
        })
        await CheckIn.save(newCheckIn)

        return newCheckIn
    },
})
