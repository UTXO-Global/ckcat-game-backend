import { Service } from 'typedi'
import { DataReqDTO } from '../../../base/base.dto'
import { GameReward } from '../entities/game-reward.entity'
import { GameRewardUpdateReqDTO } from './dtos/game-reward-update.dto'

@Service()
export class AdminGameService {
    async getListGameReward(data: DataReqDTO) {
        return GameReward.getListGameReward(data)
    }

    async updateGameReward(data: GameRewardUpdateReqDTO) {
        return GameReward.updateGameRewards(data)
    }
}
