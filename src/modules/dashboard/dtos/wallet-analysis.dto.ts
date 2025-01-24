import { Expose } from 'class-transformer'

export class WalletAnalysisDTO {
    @Expose()
    wallet: Array<WalletItemDTO>
}

export class WalletItemDTO {
    @Expose()
    date: Date

    @Expose()
    numOfWallets: number

    @Expose()
    month: number
}
