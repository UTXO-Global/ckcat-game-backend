import { AppDataSource } from '../../../database/connection'
import { GameAirdrop } from '../entities/game-airdrop.entity'
import { plainToInstance } from 'class-transformer'
import { GameAirdropDTO } from '../dtos/game-airdrop.dto'
import { GameAirdropInfoGetListReqDTO } from '../dtos/game-airdrop-info-get-list.dto'
import { parseFieldQueries } from '../../../base/base.request'
import { Errors } from '../../../utils/error'
import { GameAirdropGetDetailReqDTO } from '../dtos/game-airdrop-get-detail.dto'
import { GameAirdropTransactionRepos } from './game-airdrop-transaction.repos'
import { GameAirdropAdminGetListReqDTO } from '../dtos/game-airdrop-admin-get-list-get.dto'
import { User } from '../../user/entities/user.entity'

export const GameAirdropRepos = AppDataSource.getMongoRepository(
    GameAirdrop
).extend({
    async getGameAirdropList(data: GameAirdropInfoGetListReqDTO) {
        const { pagination, sort, userId } = data

        const airdropRepository = AppDataSource.getMongoRepository(GameAirdrop)
        const profile = await User.getUser(userId)
        if (!profile) throw Errors.UserNotFound
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
                    totalParticipations: 1,
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

        // Count total matching records (phải áp dụng cùng điều kiện lọc)
        pagination.total = await airdropRepository.count()

        return {
            gems: profile.gems,
            airdropRecords: plainToInstance(GameAirdropDTO, airdropRecords, {
                excludeExtraneousValues: true,
            }),
            pagination,
        }
    },

    async getGameAirdopDetail(data: GameAirdropGetDetailReqDTO) {
        const { userId, gameAirdropId } = data
        const airdropRepository = AppDataSource.getMongoRepository(GameAirdrop)

        const profile = await User.getUser(userId)
        if (!profile) throw Errors.UserNotFound

        const airdrop = await airdropRepository.findOneBy({
            where: { gameAirdropId },
        })
        if (!airdrop) throw Errors.BadRequest
        // if (!airdrop) throw Errors.GameAirdropNotFound

        const transactionAirdrop = await GameAirdropTransactionRepos.countBy({
            userId,
            gameAirdropId,
        })

        return {
            userId,
            gemsAvailable: profile.gems,
            airdropTitle: airdrop.gameAirdropTitle,
            assetGiven: airdrop.assetGiven,
            quantityAssetGiven: airdrop.quantityAssetGiven,
            quantityPayment: airdrop.quantityPayment,
            currencyPayment: airdrop.currencyPayment,
            totalJoinAirdrop: transactionAirdrop,
        }
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
        const gameAirdrops = await GameAirdropRepos.aggregate(
            pipeline
        ).toArray()

        pagination.total = await GameAirdropRepos.count()

        return {
            gameAirdrops: plainToInstance(GameAirdropDTO, gameAirdrops, {
                excludeExtraneousValues: true,
            }),
            pagination,
        }
    },
})
