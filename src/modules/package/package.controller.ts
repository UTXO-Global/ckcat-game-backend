import { Inject, Service } from 'typedi'
import { NextFunction, Response } from 'express'
import { ResponseWrapper } from '../../utils/response'
import { PackageService } from './package.service'
import { CKAuthRequest } from '../auth/auth.middleware'

@Service()
export class PackageController {
    constructor(
        @Inject() public packageService: PackageService
    ) {}

    getPackages = async (
        req: CKAuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            res.send(
                new ResponseWrapper(await this.packageService.getPackages())
            )
        } catch (err) {
            next(err)
        }
    }
}
