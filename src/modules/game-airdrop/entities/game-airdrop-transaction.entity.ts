import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm'
import { AppBaseEntity } from '../../../base/base.entity'

@Entity()
export class GameAirdropTransaction extends AppBaseEntity {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    gameAirdropTransactionId: string

    @Column()
    userId: string

    @Column()
    gameAirdropId: string

    @Column()
    paymentAirdropAmount: number

    @Column()
    rewardAirdropAmount: number
}
