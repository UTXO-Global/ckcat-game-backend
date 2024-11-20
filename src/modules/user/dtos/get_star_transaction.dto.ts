import { Expose } from 'class-transformer'
import { BaseReqDTO } from '../../../base/base.dto'

export class GetStarTransactionReqDTO extends BaseReqDTO {
    @Expose()
    offset: number

    @Expose()
    limit: number
}
