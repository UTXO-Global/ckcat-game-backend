import { Inject, Service } from 'typedi'
import { NextFunction, Response } from 'express'
import { DataRequest } from '../../../base/base.request'
import { OrderListReqDTO } from '../dtos/order-list-req.dto'
import { OrderAdminService } from './order-admin.service'
import { ResponseWrapper } from '../../../utils/response'
import { Pagination } from '../../../helpers/response.wrapper'

@Service()
export class OrderAdminController {
    constructor(@Inject() public orderAdminService: OrderAdminService) {}

    getOrders = async (
        req: DataRequest<OrderListReqDTO>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const params = {
                pagination: Pagination.fromReq(req),
                userId: req.params.userId,
            }
            const { data, pagination } = await this.orderAdminService.getOrders(
                params
            )
            res.send(new ResponseWrapper(data ?? null, null, pagination))
        } catch (err) {
            next(err)
        }
    }
}
