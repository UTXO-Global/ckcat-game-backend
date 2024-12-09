import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm'
import { AppBaseEntity } from '../../../base/base.entity'

@Entity()
export class CheckIn extends AppBaseEntity {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    checkInId: string

    @Column()
    userId: string

    @Column()
    checkInDate: Date

    @Column()
    currentStreak: number
}
