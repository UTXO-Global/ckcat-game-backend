import { Expose } from 'class-transformer'
import { BaseReqDTO } from '../../../base/base.dto'

export class InternalRefferalReqDTO extends BaseReqDTO {
    @Expose()
    userId: string

    @Expose()
    code: string
}
