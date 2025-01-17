import { Expose } from 'class-transformer'
import { IsEnum } from 'class-validator'
import { BotSettingKey } from '../types/bot-setting.type'
import { DataCKReqDTO } from '../../../base/base.dto'

export class BotSettingGetDetailReqDTO extends DataCKReqDTO {
    @Expose()
    @IsEnum(BotSettingKey)
    settingKey: BotSettingKey
}
