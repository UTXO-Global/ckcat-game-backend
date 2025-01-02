import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm'
import { AppBaseEntity } from '../../../base/base.entity'
import { WalletTask } from '../types/wallet-task.type'

@Entity()
export class WalletTraceLog extends AppBaseEntity {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    traceLogId: string

    @Column()
    userId: string

    @Column()
    walletAddress: string

    @Column()
    walletTask: WalletTask
}
