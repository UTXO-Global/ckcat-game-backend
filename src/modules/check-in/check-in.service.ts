import { Inject, Service } from 'typedi'
import { CheckInRepos } from './repos/check-in.repos'
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
            const checkIn = await CheckInRepos.checkIn(userId)
            await this.claimCheckInReward(checkIn, manager)
            return checkIn
        })
    }

    async claimCheckInReward(checkIn: CheckIn, manager: EntityManager) {
        const { checkInId, currentStreak, userId } = checkIn

        // get rewards by streak
        const rewards = await manager.findOne(CheckInReward, {
            where: { dayStreak: currentStreak },
        })
        if (!rewards) {
            throw Errors.CheckInRewardNotFound
        }

        const { rewardCode, rewardValue } = rewards

        const claimReward = new CheckInClaimReward()
        claimReward.checkInId = checkInId
        claimReward.rewardCode = rewardCode
        claimReward.rewardValue = rewardValue

        await manager.save(CheckInClaimReward, claimReward)
        await this.gemsService.gemsHistory({
            userId,
            type: 'check-in',
            gems: rewardValue,
        })
    }
}
