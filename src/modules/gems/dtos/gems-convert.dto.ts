import { Expose } from 'class-transformer'
import { BaseReqDTO } from '../../../base/base.dto'
import { IsNumber } from 'class-validator'

export class GemsConvertDTO extends BaseReqDTO {
    @Expose()
    initData: string

    @Expose()
    convertAddress: string

    @Expose()
    @IsNumber()
    gems: number
}
