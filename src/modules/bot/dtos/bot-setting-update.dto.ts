import { Expose } from 'class-transformer'
import { IsOptional } from 'class-validator'
import { DataCKReqDTO } from '../../../base/base.dto'

export class BotSettingUpdateReqDTO extends DataCKReqDTO {
    @Expose()
    @IsOptional()
    urlImage?: string

    @Expose()
    @IsOptional()
    content?: string

    @Expose()
    @IsOptional()
    buttons?: { text: string; url: string }[]
}
