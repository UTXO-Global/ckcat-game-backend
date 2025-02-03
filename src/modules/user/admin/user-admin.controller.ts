import { NextFunction, Response } from 'express'
import { Inject, Service } from 'typedi'
import { DataRequest } from '../../../base/base.request'
import { ResponseWrapper } from '../../../utils/response'
import { UserAdminGetListReqDTO } from './dtos/user-admin-get-list-req.dto'
import { UserAdminService } from './user-admin.service'
import { UserAdminGetReqDTO } from './dtos/user-admin-get-req.dto'

@Service()
export class UserAdminController {
    constructor(@Inject() public userAdminService: UserAdminService) {}

    async getUsers(
        req: DataRequest<UserAdminGetListReqDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { data } = req
            const { users, pagination } = await this.userAdminService.getUsers(
                data
            )
            res.send(new ResponseWrapper(users, null, pagination))
        } catch (error) {
            next(error)
        }
    }

    async getUser(
        req: DataRequest<UserAdminGetReqDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { data } = req
            const user = await this.userAdminService.getUser(data)
            res.send(new ResponseWrapper(user))
        } catch (error) {
            next(error)
        }
    }
}
