import { Inject, Service } from 'typedi'
import { NextFunction, Response } from 'express'
import { Pagination, ResponseWrapper } from '../../utils/response'
import { OrderDTO } from '../order/dtos/order.dto'
import { OrderService } from './order.service'
import { DataRequest } from '../../base/base.request'
import { OrderDetailReqDTO } from './dtos/order-detail-req.dto'
import { OrderListReqDTO } from './dtos/order-list-req.dto'

@Service()
export class OrderController {
    constructor(
        @Inject() public orderService: OrderService
    ) {}

    createOrder = async (
        req: DataRequest<OrderDTO>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const params = req.body
            params.userId = req.userId
            const order = await this.orderService.createOrder(params)
            res.send(new ResponseWrapper(order))
        } catch (err) {
            next(err)
        }
    }

    getOrder = async (
        req: DataRequest<OrderDetailReqDTO>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { userId } = req
            res.send(
                new ResponseWrapper(await this.orderService.getOrder(userId, req.params.orderId))
            )
        } catch (err) {
            next(err)
        }
    }

    getOrders = async (
        req: DataRequest<OrderListReqDTO>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const params = {
                pagination : Pagination.fromReq(req),
                userId :req.userId,
            }
            const { data, pagination } = await this.orderService.getOrders(params)
            res.send(new ResponseWrapper(data ?? null, null, pagination))
        } catch (err) {
            next(err)
        }
    }
}
