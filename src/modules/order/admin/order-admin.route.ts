import { Router } from 'express'
import { Inject, Service } from 'typedi'
import { BaseRoute } from '../../../app'
import { OrderAdminController } from './order-admin.controller'
import { AuthMiddleware } from '../../auth/auth.middleware'
import { AuthAdminMiddleware } from '../../admin/auth/auth-admin.middleware'

@Service()
export class OrderAdminRoute implements BaseRoute {
    route?: string = 'order'
    router: Router = Router()

    constructor(
        @Inject() private orderAdminController: OrderAdminController,
        @Inject() private authAdminMiddleware: AuthAdminMiddleware
    ) {
        this.initRoutes()
    }

    private initRoutes() {
        this.router.get(
            '/orders/:userId',
            this.authAdminMiddleware.authorize.bind(this.authAdminMiddleware),
            this.orderAdminController.getOrders.bind(this.orderAdminController)
        )
    }
}
