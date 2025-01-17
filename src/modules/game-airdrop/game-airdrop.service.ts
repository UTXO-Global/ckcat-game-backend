import { Service } from 'typedi'
import { GameAirdropTransactionRepos } from './repos/game-airdrop-transaction.repos'
import { GameAirdropInfoGetListReqDTO } from './dtos/game-airdrop-info-get-list.dto'
import { GameAirdropRepos } from './repos/game-airdrop.repos'
import { GameAirdropJoinReqDTO } from './dtos/game-airdrop-join.dto'
import { getNowUtc, randomID } from '../../utils'
import { startTransaction } from '../../database/connection'
import { User } from '../user/entities/user.entity'
import { GameAirdrop } from './entities/game-airdrop.entity'
import { Errors } from '../../utils/error'
import { WalletType } from './types/wallet.type'
import { UserWallet } from '../wallet/entities/user-wallet.entity'
import { Gems } from '../gems/entities/gems.entity'
import { GemsType } from '../gems/types/gems.type'
import { GameAirdropGetDetailReqDTO } from './dtos/game-airdrop-get-detail.dto'
import { GameAirdropUserGetReqDTO } from './dtos/game-airdrop-user-get.dto'

@Service()
export class GameAirdropService {
    async joinAirdrop(data: GameAirdropJoinReqDTO) {
        const { gameAirdropId, userId } = data
        const now = getNowUtc()
        const currentDate = new Date(now)
        return await startTransaction(async (manager) => {
            const [profile, airdrop, totalJoinAirdrop, userWallet] =
                await Promise.all([
                    User.getUser(userId),
                    manager.findOne(GameAirdrop, {
                        where: { gameAirdropId },
                    }),
                    GameAirdropTransactionRepos.countBy({
                        userId,
                        gameAirdropId,
                    }),
                    UserWallet.getWalletByUserId(userId),
                ])
            if (!profile) throw Errors.UserNotFound
            if (!airdrop) throw Errors.GameAirdropNotFound
            // validate expire time
            if (currentDate >= airdrop.participateCloseDate) {
                throw Errors.AirdropClosed
            }
            const oldBalance = profile.gems
            // Validate wallet type, skip check if walletType is NOWALLET
            switch (airdrop.walletType) {
                case WalletType.NOWALLET:
                    break
                case WalletType.UTXO:
                    if (!userWallet.address) {
                        throw Errors.WalletAddressNotFound
                    }
                    break
                default:
                    throw Errors.WalletTypeNotSupport
            }
            //validate limit participate airdrop
            if (totalJoinAirdrop >= airdrop.maxParticipations) {
                throw Errors.MaxParticipationReached
            }
            // check gems available
            if (profile.gems < airdrop.quantityPayment) {
                throw Errors.NotEnoughGems
            }
            profile.gems -= airdrop.quantityPayment
            airdrop.totalParticipations += 1
            await Promise.all([
                Gems.createGems(
                    {
                        userId,
                        type: GemsType.JoinAirdrop,
                        gems: -airdrop.quantityPayment,
                    },
                    manager
                ),
                GameAirdropTransactionRepos.createAirdropTransaction(
                    {
                        gameAirdropTransactionId: randomID(),
                        userId,
                        gameAirdropId,
                        paymentAirdropAmount: airdrop.quantityPayment,
                        rewardAirdropAmount: airdrop.quantityAssetGiven,
                    },
                    manager
                ),
                User.updateUser(profile, manager),
                manager.update(
                    GameAirdrop,
                    { gameAirdropId },
                    { totalParticipations: airdrop.totalParticipations }
                ),
            ])
            return true
        })
    }
    async getAirdropDetails(data: GameAirdropGetDetailReqDTO) {
        return await GameAirdropRepos.getGameAirdopDetail(data)
    }
    async getAirdropTxUser(data: GameAirdropUserGetReqDTO) {
        return await GameAirdropTransactionRepos.getAirdropUser(data)
    }
    async getListAirdrop(data: GameAirdropInfoGetListReqDTO) {
        return await GameAirdropRepos.getGameAirdropList(data)
    }
}
