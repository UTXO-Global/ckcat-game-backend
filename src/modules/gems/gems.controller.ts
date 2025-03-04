import { Inject, Service } from 'typedi'
import { NextFunction, Response } from 'express'
import { ResponseWrapper } from '../../utils/response'
import { GemsDTO } from '../gems/dtos/gems.dto'
import { GemsService } from './gems.service'
import { DataRequest } from '../../base/base.request'
import { GemsConvertDTO } from './dtos/gems-convert.dto'

@Service()
export class GemsController {
    constructor(@Inject() public gemsService: GemsService) {}

    gemsHistory = async (
        req: DataRequest<GemsDTO>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const params = req.body
            params.userId = req.userId
            await this.gemsService.gemsHistory(params)
            res.send(new ResponseWrapper(true))
        } catch (err) {
            next(err)
        }
    }

    convertGems = async (
        req: DataRequest<GemsConvertDTO>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const result = await this.gemsService.convertGems(req.data)
            res.send(new ResponseWrapper(result))
        } catch (err) {
            next(err)
        }
    }
}
