import { BaseReqDTO } from '../../../base/base.dto'
import { Expose } from 'class-transformer'

export class TransactionDTO extends BaseReqDTO {
    @Expose()
    userId: string

    @Expose()
    orderId: string

    @Expose()
    txHash: string

    @Expose()
    price: number

    @Expose()
    status: string
}
