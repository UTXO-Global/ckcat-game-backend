import { Expose } from 'class-transformer'
import { BaseReqPurchaseValueDTO } from '../../../base/base.dto'

export class PurchaseReqDTO extends BaseReqPurchaseValueDTO {
    @Expose()
    numberAmount: number
}
