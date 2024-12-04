import { Service } from 'typedi'
import { startTransaction } from '../../database/connection'
import { OrderDTO } from './dtos/order.dto'
import { Order } from './entities/order.entity'
import { Package } from '../package/entities/package.entity'
import { OrderListReqDTO } from './dtos/order-list-req.dto'

@Service()
export class OrderService {

    async createOrder(data: OrderDTO) {
        return await startTransaction(async (manager) => {
            const packageModel = await Package.getPackage(data.packageId);
            const transactionDTO = new OrderDTO()
            transactionDTO.init(data)
            transactionDTO.price = packageModel.price;
            return await Order.createOrder(transactionDTO, manager)
        })
    }

    async getOrder(userId: string, OrderId: string) {
        return await Order.getOrder(userId, OrderId)
    }

    async getOrders(data: OrderListReqDTO) {
        return await Order.getOrders(data)
    }
    
}
