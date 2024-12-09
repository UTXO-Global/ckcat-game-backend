import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm'
import { AppBaseEntity } from '../../../base/base.entity'
import { EventSettingKey } from '../types/event-setting.type'

@Entity()
export class EventSetting extends AppBaseEntity {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    eventSettingId: number

    @Column()
    eventSettingKey: string

    @Column()
    gems: number

    static async getEventSettingByKey(eventSettingKey: EventSettingKey) {
        return await EventSetting.findOne({
            where: {
                eventSettingKey,
            },
        })
    }
}
