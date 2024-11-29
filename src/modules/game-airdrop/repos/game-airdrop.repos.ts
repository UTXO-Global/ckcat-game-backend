import { plainToInstance } from 'class-transformer'
import { AppDataSource } from '../../../database/connection'
import { Errors } from '../../../utils/error'
import { User } from '../../user/entities/user.entity'
import { GameAirdropGetListReqDTO } from '../dtos/game-airdrop-get-list.dto'
import { GameAirdrop } from '../entities/game-airdrop.entity'
import { GameAirdropDTO } from '../dtos/game-airdrop.dto'
import { parseFieldQueries } from '../../../base/base.request'
import { GameAirdropTransactionRepos } from './game-airdrop-transaction.repos'
import { GameAirdropGetDetailReqDTO } from '../dtos/game-airdrop-get-detail.dto'

export const GameAirdropRepos = AppDataSource.getMongoRepository(
    GameAirdrop
).extend({
    async getGameAirdropList(data: GameAirdropGetListReqDTO) {
        const { pagination, sort, userId } = data

        const userProfile = await User.getUser(userId)
        if (!userProfile) throw Errors.UserNotFound
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
        const airdropRecords = await this.aggregate(pipeline).toArray()

        // Count total matching records
        pagination.total = await this.count()

        return {
            gems: userProfile.gems,
            airdropRecords: plainToInstance(GameAirdropDTO, airdropRecords, {
                excludeExtraneousValues: true,
            }),
            pagination,
        }
    },

    async getGameAirdopDetail(data: GameAirdropGetDetailReqDTO) {
        const { userId, gameAirdropId } = data

        const profile = await User.getUser(userId)
        if (!profile) throw Errors.UserNotFound

        const airdrop = await this.findOneBy({
            where: { gameAirdropId },
        })
        if (!airdrop) throw Errors.AirdropNotFound

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
})
