import { Inject, Service } from 'typedi'
import { NextFunction, Response } from 'express'
import { ResponseWrapper } from '../../utils/response'
import { ItemService } from './item.service'
import { DataRequest } from '../../base/base.request'
import { GetItemByTypeReqDTO } from './dtos/item-get-by-type.dto'
import { BuyItemByTypeReqDTO } from './dtos/item-buy-by-type.dto'

@Service()
export class ItemController {
    constructor(
        @Inject() public itemService: ItemService
    ) {}

    getItems = async (
        req: DataRequest<GetItemByTypeReqDTO>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            res.send(
                new ResponseWrapper(await this.itemService.getItems(req.data))
            )
        } catch (err) {
            next(err)
        }
    }

    updateGemsByItem = async (
        req: DataRequest<BuyItemByTypeReqDTO>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const params = req.body
            params.userId = req.userId
            await this.itemService.updateGemsByItem(params)
            res.send(new ResponseWrapper(true))
        } catch (err) {
            next(err)
        }
    }
}
