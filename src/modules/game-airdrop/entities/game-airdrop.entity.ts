import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm'
import { AppBaseEntity } from '../../../base/base.entity'
import { CurrencyType } from '../types/currency.type'
import { WalletType } from '../types/wallet.type'

@Entity()
export class GameAirdrop extends AppBaseEntity {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    gameAirdropId: string

    @Column()
    gameAirdropTitle: string

    @Column()
    assetGiven: string

    @Column()
    quantityAssetGiven: number

    @Column()
    participateCloseDate: Date

    @Column()
    quantityPayment: number

    @Column()
    currencyPayment: CurrencyType

    @Column()
    maxParticipations: number

    @Column()
    totalParticipations: number

    @Column()
    walletType: WalletType
}
