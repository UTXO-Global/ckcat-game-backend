import { Inject, Service } from 'typedi'
import { CheckIn } from './entities/check-in.entity'
import { EntityManager } from 'typeorm'
import { CheckInReward } from './entities/check-in-reward.entity'
import { GemsService } from '../gems/gems.service'
import { startTransaction } from '../../database/connection'
import { CheckInClaimReward } from './entities/check-in-claim-reward.entity'
import { Errors } from '../../utils/error'

@Service()
export class CheckInService {
    constructor(@Inject() private gemsService: GemsService) {}

    async checkIn(userId: string) {
        return await startTransaction(async (manager) => {
            const checkIn = await CheckIn.checkIn(userId)
            await this.claimCheckInReward(checkIn, manager)
            return checkIn
        })
    }

    async claimCheckInReward(checkIn: CheckIn, manager: EntityManager) {
        const { checkInId, currentStreak, userId } = checkIn

        // get rewards by streak
        const rewards = await CheckInReward.getReward(currentStreak)
        if (!rewards) {
            throw Errors.CheckInRewardNotFound
        }

        const { rewardCode, rewardValue } = rewards

        await CheckInClaimReward.createCheckInClaimReward(
            {
                checkInId,
                rewardCode,
                rewardValue,
            },
            manager
        )

        const eligibleStreaks = [5, 10, 15, 20, 25, 30]
        if (eligibleStreaks.includes(currentStreak)) {
            await this.gemsService.gemsHistory({
                userId,
                type: 'check-in',
                gems: rewardValue,
            })
        }
    }
}
