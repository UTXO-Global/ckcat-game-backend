import { Inject, Service } from 'typedi'
import { InternalService } from './internal.service'
import { NextFunction, Response } from 'express'
import { ResponseWrapper } from '../../utils/response'
import { CKAuthRequest } from '../auth/auth.middleware'
import { DataRequest } from '../../base/base.request'
import { InternalRefferalReqDTO } from './dtos/internal-refferal.dto'
import { InternalLeaderboardReqDTO } from './dtos/internal-leaderboard.dto'

@Service()
export class InternalController {
    constructor(@Inject() public internalService: InternalService) {}

    async dailyCheckin(req: CKAuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await this.internalService.dailyCheckin(req.userId)
            res.send(new ResponseWrapper(result))
        } catch (err) {
            if (err.status && err.message) {
                res.status(err.status).send(new ResponseWrapper(null, err))
            } else {
                next(err)
            }
        }
    }

    async getProfile(req: CKAuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await this.internalService.getProfile(req.userId)
            res.send(new ResponseWrapper(result))
        } catch (err) {
            if (err.status && err.message) {
                res.status(err.status).send(new ResponseWrapper(null, err))
            } else {
                next(err)
            }
        }
    }

    async addReferral(
        req: DataRequest<InternalRefferalReqDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            req.data.userId = req.userId
            const result = await this.internalService.addRefferal(req.data)
            res.send(new ResponseWrapper(result))
        } catch (err) {
            if (err.status && err.message) {
                res.status(err.status).send(new ResponseWrapper(null, err))
            } else {
                next(err)
            }
        }
    }

    async getLeaderboard(
        req: DataRequest<InternalLeaderboardReqDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            req.data.userId = req.userId
            const result = await this.internalService.getLeaderboard(req.data)
            res.send(result)
        } catch (err) {
            if (err.status && err.message) {
                res.status(err.status).send(new ResponseWrapper(null, err))
            } else {
                next(err)
            }
        }
    }

    async getListReferral(
        req: CKAuthRequest,
        res: Response,
        next: NextFunction
    ) {
        try {
            const result = await this.internalService.getListReferral(
                req.userId
            )
            res.send(new ResponseWrapper(result))
        } catch (err) {
            if (err.status && err.message) {
                res.status(err.status).send(new ResponseWrapper(null, err))
            } else {
                next(err)
            }
        }
    }
}
