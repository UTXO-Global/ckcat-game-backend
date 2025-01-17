import { Service } from 'typedi'
import { GameAirdropCreateReqDTO } from '../dtos/game-airdrop-create.dto'
import { startTransaction } from '../../../database/connection'
import { GameAirdropAdminRepos } from './repos/game-airdrop-admin.repos'
import { randomID } from '../../../utils'
import { GameAirdropGetListReqDTO } from '../dtos/game-airdrop-list-get.dto'
import { GameAirdropTransactionRepos } from '../repos/game-airdrop-transaction.repos'
import { GameAirdropAdminGetListReqDTO } from '../dtos/game-airdrop-admin-get-list-get.dto'
import { GameAirdropTransactionAdminGetListReqDTO } from '../dtos/game-airdrop-transaction-admin-get-list-req.dto'
import { GameAirdropTransactionAdminRepos } from './repos/game-airdrop-transaction-admin.repos'

@Service()
export class GameAirdropAdminService {
    async createGameAirdrop(data: GameAirdropCreateReqDTO) {
        return await startTransaction(async (manager) => {
            return await GameAirdropAdminRepos.createGameAirdrop(
                {
                    ...data,
                    gameAirdropId: randomID(),
                    totalParticipations: 0,
                },
                manager
            )
        })
    }

    async getGameAirdrops(data: GameAirdropAdminGetListReqDTO) {
        return await GameAirdropAdminRepos.getGameAirdrops(data)
    }

    async getAirdropsTransactions(
        data: GameAirdropTransactionAdminGetListReqDTO
    ) {
        return await GameAirdropTransactionAdminRepos.getAirdropsTransactions(
            data
        )
    }
}
