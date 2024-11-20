import { Expose } from 'class-transformer'
import { BaseReqDTO } from '../../../base/base.dto'

export class RefundPurchaseStarsReqDTO extends BaseReqDTO {
    @Expose()
    userId: number

    @Expose()
    telegramPaymentChargeId: string
}
