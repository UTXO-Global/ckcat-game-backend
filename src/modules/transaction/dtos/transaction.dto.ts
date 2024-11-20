import { BaseDTO } from '../../../base/base.dto'
import { Expose } from 'class-transformer'
import { PurchaseReqDTO } from '../../user/dtos/purchase_req.dto'

export class TransactionDTO extends BaseDTO {
    @Expose()
    userId: string

    @Expose()
    orderId: string

    @Expose()
    title: string

    @Expose()
    description: string

    @Expose()
    numberCoin: number

    @Expose()
    price: number

    @Expose()
    currency: string

    @Expose()
    providerToken: string

    @Expose()
    telegramPaymentChargeId: string

    @Expose()
    providerPaymentChargeId: string
}
