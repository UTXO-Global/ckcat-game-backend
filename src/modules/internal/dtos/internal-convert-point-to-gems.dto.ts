import { Expose } from 'class-transformer'
import { BaseReqDTO } from '../../../base/base.dto'

export class InternalConvertPointToGemsDTO extends BaseReqDTO {
    @Expose()
    userId: string

    @Expose()
    points: number
}
