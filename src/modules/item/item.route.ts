import { Router } from 'express'
import { Inject, Service } from 'typedi'
import { BaseRoute } from '../../app'
import { AuthMiddleware } from '../auth/auth.middleware'
import { ItemController } from './item.controller'
import { transformAndValidate } from '../../utils/validator'
import { GetItemByTypeReqDTO } from './dtos/item-get-by-type.dto'
import { BuyItemByTypeReqDTO } from './dtos/item-buy-by-type.dto'

@Service()
export class ItemRoute implements BaseRoute {
    route?: string = 'item'
    router: Router = Router()

    constructor(
        @Inject() private itemController: ItemController,
        @Inject() private authMiddleware: AuthMiddleware
    ) {
        this.initRoutes()
    }

    private initRoutes() {

        this.router.get(
            '/items/:type',
            transformAndValidate(GetItemByTypeReqDTO),
            this.authMiddleware.authorization.bind(this.authMiddleware),
            this.itemController.getItems.bind(this.itemController)
        )

        this.router.post(
            '/update-gems-by-item',
            transformAndValidate(BuyItemByTypeReqDTO),
            this.authMiddleware.authorization.bind(this.authMiddleware),
            this.itemController.updateGemsByItem.bind(this.itemController)
        )
    }
}
