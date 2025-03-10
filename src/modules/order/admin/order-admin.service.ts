import { Service } from 'typedi'
import { OrderListReqDTO } from '../dtos/order-list-req.dto'
import { Order } from '../entities/order.entity'

@Service()
export class OrderAdminService {
    async getOrders(data: OrderListReqDTO) {
        return await Order.getOrders(data)
    }
}
