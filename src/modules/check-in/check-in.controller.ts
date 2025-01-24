import { Inject, Service } from 'typedi'
import { CheckInService } from './check-in.service'
import { CKAuthRequest } from '../auth/auth.middleware'
import { NextFunction, Response } from 'express'
import { ResponseWrapper } from '../../utils/response'

@Service()
export class CheckInController {
    constructor(@Inject() private checkInService: CheckInService) {}
    checkIn = async (req: CKAuthRequest, res: Response, next: NextFunction) => {
        try {
            const { userId } = req
            res.send(
                new ResponseWrapper(await this.checkInService.checkIn(userId))
            )
        } catch (err) {
            next(err)
        }
    }
}
