import { Column, Entity, Index, ObjectIdColumn } from 'typeorm'
import { ObjectId } from 'bson'
import { AppBaseEntity } from '../../../base/base.entity'

@Entity()
export class Admin extends AppBaseEntity {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    id: string

    @Column()
    email: string

    @Column()
    password: string

    @Index()
    @Column({ length: 6 })
    salt: string
}
