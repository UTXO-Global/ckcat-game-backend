import { BaseReqDTO } from '../../../base/base.dto'
import { Expose } from 'class-transformer'

export class GemsDTO extends BaseReqDTO {
    @Expose()
    userId: string

    @Expose()
    type: string

    @Expose()
    gems: number
}
