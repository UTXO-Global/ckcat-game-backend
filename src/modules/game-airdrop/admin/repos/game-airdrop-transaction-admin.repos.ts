import { plainToInstance } from 'class-transformer'
import { AppDataSource } from '../../../../database/connection'
import { GameAirdropTransactionAdminGetListReqDTO } from '../../dtos/game-airdrop-transaction-admin-get-list-req.dto'
import { GameAirdropTransaction } from '../../entities/game-airdrop-transaction.entity'
import { GameAirdropTransactionDTO } from '../../dtos/game-airdrop-transaction.dto'
import { Pagination } from '../../../../utils/response'
import { parseFieldQueries } from '../../../../base/base.request'

export const GameAirdropTransactionAdminRepos =
    AppDataSource.getMongoRepository(GameAirdropTransaction).extend({
        async getAirdropsTransactions(
            data: GameAirdropTransactionAdminGetListReqDTO
        ) {
            const { pagination, sort, gameAirdropId } = data

            const pipeline = this.getGameAirdropTransactionQuery(
                sort,
                pagination
            )

            // Combine match conditions
            const match: any = {}
            if (gameAirdropId) match.gameAirdropId = gameAirdropId

            if (Object.keys(match).length > 0) {
                pipeline.push({ $match: match })
            }

            const airdrops = await GameAirdropTransactionAdminRepos.aggregate(
                pipeline
            ).toArray()

            pagination.total = await GameAirdropTransactionAdminRepos.count(
                match
            )

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

        getGameAirdropTransactionQuery(sort: string, pagination: Pagination) {
            const skip = (pagination.page - 1) * pagination.limit

            // Sort logic
            const sortObj: Record<string, 1 | -1> = {}
            if (sort) {
                const sortQueries = parseFieldQueries(
                    sort,
                    new Set(['createdAt'])
                )
                for (const query of sortQueries) {
                    sortObj[query.field] = query.value === 'asc' ? 1 : -1
                }
            } else {
                sortObj.createdAt = -1
            }

            return [
                {
                    $lookup: {
                        from: 'user',
                        localField: 'userId',
                        foreignField: 'id',
                        as: 'userDetail',
                    },
                },
                {
                    $unwind: {
                        path: '$userDetail',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $lookup: {
                        from: 'game_airdrop',
                        localField: 'gameAirdropId',
                        foreignField: 'gameAirdropId',
                        as: 'airdrop',
                    },
                },
                {
                    $unwind: {
                        path: '$airdrop',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $lookup: {
                        from: 'user_wallet',
                        localField: 'userId',
                        foreignField: 'userId',
                        as: 'profile',
                    },
                },
                {
                    $unwind: {
                        path: '$profile',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $project: {
                        id: 1,
                        createdAt: 1,
                        userId: 1,
                        gameAirdropTransactionId: 1,
                        gameAirdropId: 1,
                        paymentAirdropAmount: 1,
                        rewardAirdropAmount: 1,
                        walletType: '$airdrop.walletType',
                        'userDetail.firstName': 1,
                        'userDetail.username': 1,
                        'userDetail.lastName': 1,
                        'airdrop.maxParticipations': 1,
                        'airdrop.totalParticipations': 1,
                        'profile.address': 1,
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
    })
