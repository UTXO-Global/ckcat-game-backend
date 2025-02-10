import { BaseReqDTO } from '../../../base/base.dto'
import { Expose } from 'class-transformer'
import { OrderStatusTypes } from '../types/order-status.type'
import { generateRandomString } from '../../../utils'

export class OrderDTO extends BaseReqDTO {
    @Expose()
    userId: string

    @Expose()
    orderId: string

    @Expose()
    packageId: string

    @Expose()
    price: number

    @Expose()
    status: string

    init(data: OrderDTO) {
        this.userId = data.userId
        this.orderId = generateRandomString(12)
        this.packageId = data.packageId
        this.price = data.price
        this.status = OrderStatusTypes.Pending
    }
}
