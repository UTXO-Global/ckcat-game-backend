import { EntityManager } from 'typeorm'
import { AppDataSource } from '../../../database/connection'
import { GameAirdropTransactionCreateReqDTO } from '../dtos/game-airdrop-transaction-create.dto'
import { GameAirdropTransaction } from '../entities/game-airdrop-transaction.entity'

export const GameAirdropTransactionRepos = AppDataSource.getMongoRepository(
    GameAirdropTransaction
).extend({
    async createAirdropTransaction(
        data: GameAirdropTransactionCreateReqDTO,
        manager: EntityManager
    ) {
        const recordAirdrop = await manager.save(
            GameAirdropTransaction.create({
                ...data,
            })
        )
        return recordAirdrop
    },
})
