import { Expose } from 'class-transformer'
import { BaseReqDTO } from '../../../base/base.dto'

export class GemsConvertDTO extends BaseReqDTO {
    @Expose()
    initData: string

    @Expose()
    convertAddress: string

    @Expose()
    gems: number
}
