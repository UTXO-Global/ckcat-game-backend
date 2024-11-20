import { BaseDTO } from '../../../base/base.dto'
import { Expose } from 'class-transformer'
import { PurchaseReqDTO } from '../../user/dtos/purchase_req.dto'

export class InvoiceDTO extends BaseDTO {
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
    isPaid: boolean

    init(orderId: string, userId: string, data: PurchaseReqDTO) {
        this.orderId = orderId
        this.userId = userId
        this.title = data.title
        this.description = data.description
        this.numberCoin = data.numberCoin
        this.price = data.numberAmount
        this.currency = data.currency
        this.providerToken = data.providerToken
        this.isPaid = false
    }
}
