import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm'
import { AppBaseEntity } from '../../../base/base.entity'
import { GemsSettingType } from '../types/gems-setting.type'

@Entity()
export class GemsSetting extends AppBaseEntity {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    gemsSetingId: string

    @Column()
    type: string

    @Column()
    gems: number

    static async getSettingType(type: GemsSettingType) {
        return await GemsSetting.findOne({
            where: {
                type,
            },
        })
    }
}
