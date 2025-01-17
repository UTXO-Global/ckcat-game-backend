import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm'
import { AppBaseEntity } from '../../../base/base.entity'

@Entity()
export class BotSetting extends AppBaseEntity {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    settingId: number

    @Column()
    settingKey: number

    @Column()
    value: number

    @Column()
    content: string

    @Column()
    urlImage: string

    @Column()
    buttons: { text: string; url: string }[]
}
