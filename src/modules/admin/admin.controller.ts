import { Inject, Service } from 'typedi'
import { AdminService } from './admin.service'
import { DataRequest } from '../../base/base.request'
import { AdminLogInReqDTO } from './dtos/admin-log-in.dto'
import { NextFunction, Response } from 'express'
import { ResponseWrapper } from '../../utils/response'
import { AdminLogOutReqDTO } from './dtos/admin-log-out.dto'
import { AdminRefreshTokenReqDTO } from './dtos/admin-refresh-token.dto'
import { AuthCMSReqDTO } from '../../base/base.dto'

@Service()
export class AdminController {
    constructor(@Inject() private adminService: AdminService) {}

    async logIn(
        req: DataRequest<AdminLogInReqDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const logIn = await this.adminService.login(req.data)
            res.send(new ResponseWrapper(logIn))
        } catch (err) {
            next(err)
        }
    }

    async logOut(
        req: DataRequest<AdminLogOutReqDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            await this.adminService.logOut(req.data)
            res.send(new ResponseWrapper(true))
        } catch (err) {
            next(err)
        }
    }

    async refreshToken(
        req: DataRequest<AdminRefreshTokenReqDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const token = await this.adminService.refreshToken(req.data)
            res.send(new ResponseWrapper(token))
        } catch (err) {
            next(err)
        }
    }

    async getProfile(
        req: DataRequest<AuthCMSReqDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const profile = await this.adminService.getProfile(req.data)
            res.send(new ResponseWrapper(profile))
        } catch (err) {
            next(err)
        }
    }
}
