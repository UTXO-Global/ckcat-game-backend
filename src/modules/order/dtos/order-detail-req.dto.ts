import { BaseReqDTO } from '../../../base/base.dto'
import { Expose } from 'class-transformer'

export class OrderDetailReqDTO extends BaseReqDTO {
    @Expose()
    orderId: string
}

