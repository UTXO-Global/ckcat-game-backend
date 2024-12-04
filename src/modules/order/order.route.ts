import { Router } from 'express'
import { Inject, Service } from 'typedi'
import { BaseRoute } from '../../app'
import { AuthMiddleware } from '../auth/auth.middleware'
import { OrderController } from './order.controller'

@Service()
export class OrderRoute implements BaseRoute {
    route?: string = 'order'
    router: Router = Router()

    constructor(
        @Inject() private orderController: OrderController,
        @Inject() private authMiddleware: AuthMiddleware
    ) {
        this.initRoutes()
    }

    private initRoutes() {
        this.router.post(
            '/create-order',
            this.authMiddleware.authorization.bind(this.authMiddleware),
            this.orderController.createOrder.bind(this.orderController)
        )
        this.router.get(
           '/detail/:orderId',
            this.authMiddleware.authorization.bind(this.authMiddleware),
            this.orderController.getOrder.bind(this.orderController)
        )
        this.router.get(
            '/orders',
            this.authMiddleware.authorization.bind(this.authMiddleware),
            this.orderController.getOrders.bind(this.orderController)
        )
    }
}
