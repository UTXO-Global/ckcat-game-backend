import { EntityManager } from 'typeorm'
import { AppDataSource } from '../../../database/connection'
import { GameAirdropGetListReqDTO } from '../dtos/game-airdrop-list-get.dto'
import { parseFieldQueries } from '../../../base/base.request'
import { Pagination } from '../../../utils/response'
import { plainToInstance } from 'class-transformer'
import { GameAirdropTransactionDTO } from '../dtos/game-airdrop-transaction.dto'
import { GameAirdropUserGetReqDTO } from '../dtos/game-airdrop-user-get.dto'
import { GameAirdropTransaction } from '../entities/game-airdrop-transaction.entity'
import { GameAirdropCreateTransactionReqDTO } from '../dtos/game-airdrop-create-transaction.dto'

export const GameAirdropTransactionRepos = AppDataSource.getMongoRepository(
    GameAirdropTransaction
).extend({
    async createAirdropTransaction(
        data: GameAirdropCreateTransactionReqDTO,
        manager: EntityManager
    ) {
        const recordAirdrop = await manager.save(
            GameAirdropTransaction.create({
                ...data,
            })
        )
        return recordAirdrop
    },

    async getAirdropsTransactionList(data: GameAirdropGetListReqDTO) {
        const { pagination, sort, gameAirdropId } = data

        const airdropRepository = AppDataSource.getMongoRepository(
            GameAirdropTransaction
        )

        const pipeline = this.getQuery(sort, pagination)

        // Combine match conditions
        const match: any = {}
        if (gameAirdropId) match.gameAirdropId = gameAirdropId

        if (Object.keys(match).length > 0) {
            pipeline.push({ $match: match })
        }

        const airdrops = await airdropRepository.aggregate(pipeline).toArray()

        pagination.total = await airdropRepository.count(match)

        return {
            gameAirdropTransactions: plainToInstance(
                GameAirdropTransactionDTO,
                airdrops,
                {
                    excludeExtraneousValues: true,
                }
            ),
            pagination,
        }
    },

    getQuery(sort: string, pagination: Pagination) {
        const skip = (pagination.page - 1) * pagination.limit

        // Sort logic
        const sortObj: Record<string, 1 | -1> = {}
        if (sort) {
            const sortQueries = parseFieldQueries(sort, new Set(['createdAt']))
            for (const query of sortQueries) {
                sortObj[query.field] = query.value === 'asc' ? 1 : -1
            }
        } else {
            // Default sorting if no sort parameter provided
            sortObj.createdAt = -1
        }

        return [
            {
                $project: {
                    id: 1,
                    createdAt: 1,
                    userId: 1,
                    gameAirdropTransactionId: 1,
                    gameAirdropId: 1,
                    paymentAirdropAmount: 1,
                    rewardAirdropAmount: 1,
                    walletType: 1,
                },
            },
            {
                $sort: sortObj,
            },
            {
                $skip: skip,
            },
            {
                $limit: pagination.limit,
            },
        ]
    },

    async getAirdropUser(data: GameAirdropUserGetReqDTO) {
        const { userId, pagination, sort, gameAirdropId } = data

        const airdropRepository = AppDataSource.getMongoRepository(
            GameAirdropTransaction
        )
        const skip = (pagination.page - 1) * pagination.limit

        const pipeline: any[] = []

        // Combine match conditions
        const match = { userId, gameAirdropId }

        // Sort logic
        const sortObj: Record<string, 1 | -1> = {}
        if (sort) {
            const sortQueries = parseFieldQueries(sort, new Set(['createdAt']))
            for (const query of sortQueries) {
                sortObj[query.field] = query.value === 'asc' ? 1 : -1
            }
        } else {
            // Default sorting if no sort parameter provided
            sortObj.createdAt = -1
        }

        // Project the necessary fields
        pipeline.push(
            { $match: match },

            {
                $lookup: {
                    from: 'game_airdrop',
                    localField: 'gameAirdropId',
                    foreignField: 'gameAirdropId',
                    as: 'gameAirdropData',
                },
            },
            {
                $unwind: {
                    path: '$gameAirdropData',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 1,
                    createdAt: 1,
                    userId: 1,
                    gameAirdropTransactionId: 1,
                    gameAirdropId: 1,
                    paymentAirdropAmount: 1,
                    rewardAirdropAmount: 1,
                    walletType: '$gameAirdropData.walletType', // Get walletType from GameAirdrop
                },
            },
            { $sort: sortObj },
            { $skip: skip },
            { $limit: pagination.limit }
        )

        // Fetch airdrop records
        const airdropRecords = await airdropRepository
            .aggregate(pipeline)
            .toArray()

        // Count total matching records
        pagination.total = await airdropRepository.count(match)

        return {
            airdropRecords: plainToInstance(
                GameAirdropTransactionDTO,
                airdropRecords,
                {
                    excludeExtraneousValues: true,
                }
            ),
            pagination,
        }
    },
})
