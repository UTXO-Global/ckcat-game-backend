import { BaseReqDTO } from '../../../base/base.dto'
import { Expose } from 'class-transformer'

export class TransactionDetailReqDTO extends BaseReqDTO {
    @Expose()
    transactionId: string
}

