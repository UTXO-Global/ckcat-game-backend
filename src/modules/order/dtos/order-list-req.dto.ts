import { Expose } from 'class-transformer'
import { Pagination } from '../../../utils/response'
import { BaseReqDTO } from '../../../base/base.dto'

export class OrderListReqDTO extends BaseReqDTO {
    pagination: Pagination

    @Expose()
    userId: string
}

