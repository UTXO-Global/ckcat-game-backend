import { EntityManager } from 'typeorm'
import { AppDataSource } from '../../../../database/connection'
import { GameAirdropCreateReqDTO } from '../../dtos/game-airdrop-create.dto'
import { GameAirdrop } from '../../entities/game-airdrop.entity'
import { parseFieldQueries } from '../../../../base/base.request'
import { GameAirdropAdminGetListReqDTO } from '../../dtos/game-airdrop-admin-get-list-get.dto'
import { plainToInstance } from 'class-transformer'
import { GameAirdropDTO } from '../../dtos/game-airdrop.dto'

export const GameAirdropAdminRepos = AppDataSource.getMongoRepository(
    GameAirdrop
).extend({
    async createGameAirdrop(
        data: GameAirdropCreateReqDTO,
        manager: EntityManager
    ) {
        const recordAirdrop = await manager.save(GameAirdrop.create(data))

        return recordAirdrop
    },

    async getGameAirdrops(data: GameAirdropAdminGetListReqDTO) {
        const { pagination, sort } = data

        const skip = (pagination.page - 1) * pagination.limit

        const pipeline: any[] = []

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

        pipeline.push(
            {
                $lookup: {
                    from: 'game_airdrop_transaction', // MongoDB collection name for GameAirdropTransaction
                    localField: 'gameAirdropId', // Field in GameAirdrop
                    foreignField: 'gameAirdropId', // Matching field in GameAirdropTransaction
                    as: 'transactions',
                },
            },
            {
                $addFields: {
                    numOfParticipants: {
                        $size: {
                            $setUnion: '$transactions.userId',
                        },
                    },
                },
            },
            {
                $project: {
                    createdAt: 1,
                    gameAirdropId: 1,
                    gameAirdropTitle: 1,
                    assetGiven: 1,
                    quantityAssetGiven: 1,
                    participateCloseDate: 1,
                    quantityPayment: 1,
                    currencyPayment: 1,
                    walletType: 1,
                    maxParticipations: 1,
                    totalParticipations: 1,
                    numOfParticipants: 1,
                },
            },
            { $sort: sortObj },
            { $skip: skip },
            { $limit: pagination.limit }
        )

        // Fetch airdrop records
        const gameAirdrops = await GameAirdropAdminRepos.aggregate(
            pipeline
        ).toArray()

        pagination.total = await GameAirdropAdminRepos.count()

        return {
            gameAirdrops: plainToInstance(GameAirdropDTO, gameAirdrops, {
                excludeExtraneousValues: true,
            }),
            pagination,
        }
    },
})
