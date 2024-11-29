import { Service } from 'typedi'
import { GameAirdropGetListReqDTO } from './dtos/game-airdrop-get-list.dto'
import { GameAirdropRepos } from './repos/game-airdrop.repos'
import { GameAirdropJoinReqDTO } from './dtos/game-airdrop-join.dto'
import { getNowUtc, randomID } from '../../utils'
import { startTransaction } from '../../database/connection'
import { User } from '../user/entities/user.entity'
import { GameAirdrop } from './entities/game-airdrop.entity'
import { GameAirdropTransactionRepos } from './repos/game-airdrop-transaction.repos'
import { Errors } from '../../utils/error'
import { WalletType } from './types/wallet.type'
import { UserWallet } from '../wallet/entities/user-wallet.entity'
import { GameAirdropGetDetailReqDTO } from './dtos/game-airdrop-get-detail.dto'

@Service()
export class GameAirdropService {
    async getListAirdrop(data: GameAirdropGetListReqDTO) {
        return await GameAirdropRepos.getGameAirdropList(data)
    }

    async getAirdropDetail(data: GameAirdropGetDetailReqDTO) {
        return await GameAirdropRepos.getGameAirdopDetail(data)
    }

    async joinAirdrop(data: GameAirdropJoinReqDTO) {
        const { gameAirdropId, userId } = data
        const now = getNowUtc()
        const currentDate = new Date(now)
        return await startTransaction(async (manager) => {
            const [userProfile, walletUser, airdrop, totalJoinAirdrop] =
                await Promise.all([
                    User.getUser(userId),
                    manager.findOne(UserWallet, { where: { userId } }),
                    manager.findOne(GameAirdrop, {
                        where: { gameAirdropId },
                        lock: { mode: 'pessimistic_write' },
                    }),
                    GameAirdropTransactionRepos.countBy({
                        userId,
                        gameAirdropId,
                    }),
                ])
            if (!userProfile) throw Errors.UserNotFound
            // if (!walletUser) throw Errors.WallletUserNotFound
            if (!airdrop) throw Errors.AirdropNotFound
            // validate expire time
            if (currentDate >= airdrop.participateCloseDate) {
                throw Errors.AirdropClosed
            }

            //validate limit participate airdrop
            if (totalJoinAirdrop >= airdrop.maxParticipations) {
                throw Errors.MaxParticipationReached
            }

            // check gems available
            if (userProfile.gems < airdrop.quantityPayment) {
                throw Errors.NotEnoughGems
            }
            userProfile.gems -= airdrop.quantityPayment
            airdrop.totalParticipations += 1

            await Promise.all([
                GameAirdropTransactionRepos.createAirdropTransaction(
                    {
                        gameAirdropTransactionId: randomID(),
                        userId,
                        gameAirdropId,
                        paymentAmount: airdrop.quantityPayment,
                        rewardAmount: airdrop.quantityAssetGiven,
                    },
                    manager
                ),
                manager.update(User, { userId }, userProfile),
                manager.update(
                    GameAirdrop,
                    { gameAirdropId },
                    { totalParticipations: airdrop.totalParticipations }
                ),
            ])

            return true
        })
    }
}
