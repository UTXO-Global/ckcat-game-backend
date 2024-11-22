import { BaseReqDTO } from '../../../base/base.dto'
import { Expose } from 'class-transformer'
import { TransactionStatusTypes } from '../types/transaction-status.type'

export class TransactionDTO extends BaseReqDTO {
    @Expose()
    userId: string

    @Expose()
    price: number

    @Expose()
    package: string

    @Expose()
    status: string

    init(data: TransactionDTO) {
        this.userId = data.userId
        this.price = data.price
        this.package = data.package
        this.status = TransactionStatusTypes.Pending
    }
}
