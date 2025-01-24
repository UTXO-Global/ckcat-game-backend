import { Expose } from 'class-transformer'
import { BaseDTO } from '../../../base/base.dto'
import { WalletType } from '../types/wallet.type'

export class GameAirdropTransactionDTO extends BaseDTO {
    @Expose()
    gameAirdropTransactionId: number

    @Expose()
    userId: string

    @Expose()
    gameAirdropId: string

    @Expose()
    paymentAirdropAmount: number

    @Expose()
    rewardAirdropAmount: number

    @Expose()
    walletType: WalletType

    @Expose()
    userDetail: object

    @Expose()
    airdrop: object

    @Expose()
    profile: object
}
