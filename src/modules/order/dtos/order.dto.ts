import { BaseReqDTO } from '../../../base/base.dto'
import { Expose } from 'class-transformer'
import { OrderStatusTypes } from '../types/order-status.type'

export class OrderDTO extends BaseReqDTO {
    @Expose()
    userId: string

    @Expose()
    packageId: string

    @Expose()
    price: number

    @Expose()
    status: string

    init(data: OrderDTO) {
        this.userId = data.userId
        this.packageId = data.packageId
        this.price = data.price
        this.status = OrderStatusTypes.Pending
    }
}
