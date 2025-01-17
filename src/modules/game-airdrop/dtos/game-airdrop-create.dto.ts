import { Expose, Transform } from 'class-transformer'
import { DataCMSReqDTO } from '../../../base/base.dto'
import { CurrencyType } from '../types/currency.type'
import { WalletType } from '../types/wallet.type'
import { isISO8601 } from 'class-validator'

export class GameAirdropCreateReqDTO extends DataCMSReqDTO {
    @Expose()
    gameAirdropId: string

    @Expose()
    gameAirdropTitle: string

    @Expose()
    assetGiven: string

    @Expose()
    quantityAssetGiven: number

    @Expose()
    @Transform(({ value }) => {
        if (value instanceof Date) {
            return value
        }
        const isValidDate = isISO8601(value, {
            strict: true,
            strictSeparator: true,
        })
        if (!isValidDate) {
            return null
        }
        return new Date(value)
    })
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
    walletType: WalletType
}
