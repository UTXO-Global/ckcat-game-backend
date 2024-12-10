import { Expose } from 'class-transformer'
import { BaseReqDTO } from '../../../base/base.dto'
import { EventSettingKey } from '../types/event-setting.type'
import { IsEnum } from 'class-validator'

export class EventSettingGetByKeyReqDTO extends BaseReqDTO {
    @Expose()
    @IsEnum(EventSettingKey)
    key: EventSettingKey
}
