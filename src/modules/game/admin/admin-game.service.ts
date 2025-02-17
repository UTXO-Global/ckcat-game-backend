import { Service } from 'typedi'
import { DataReqDTO } from '../../../base/base.dto'
import { GameReward } from '../entities/game-reward.entity'
import { GameRewardUpdateReqDTO } from './dtos/game-reward-update.dto'
import { GameRewardGetListReqDTO } from './dtos/game-reward-get-list.dto'

@Service()
export class AdminGameService {
    async getListGameReward(data: GameRewardGetListReqDTO) {
        return GameReward.getListGameReward(data)
    }

    async updateGameReward(data: GameRewardUpdateReqDTO) {
        return GameReward.updateGameRewards(data)
    }
}
