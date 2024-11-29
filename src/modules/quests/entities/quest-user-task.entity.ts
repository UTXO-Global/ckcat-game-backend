import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm'
import { AppBaseEntity } from '../../../base/base.entity'

@Entity()
export class QuestUserTask extends AppBaseEntity {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    userId: string

    @Column()
    questId: number

    @Column()
    isClaimTask: boolean

    @Column()
    isClaimDailyTask: Date
}
