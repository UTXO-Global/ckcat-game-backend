import { BaseDTO } from '../../../base/base.dto'
import { Expose } from 'class-transformer'
import { CurrencyType } from '../types/currency.type'
import { WalletType } from '../types/wallet.type'

export class GameAirdropDTO extends BaseDTO {
    @Expose()
    gameAirdropId: string

    @Expose()
    gameAirdropTitle: string

    @Expose()
    assetGiven: string

    @Expose()
    quantityAssetGiven: number

    @Expose()
    participateCloseDate: Date

    @Expose()
    quantityPayment: number

    @Expose()
    currencyPayment: CurrencyType

    @Expose()
    maxParticipations: number

    @Expose()
    totalParticipations: number

    @Expose()
    numOfParticipants: number

    @Expose()
    walletType: WalletType
}
