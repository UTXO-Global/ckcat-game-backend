import { Router } from 'express'
import { Inject, Service } from 'typedi'
import { transformAndValidate } from '../../../utils/validator'
import { BaseRoute } from '../../../app'
import { UserAdminController } from './user-admin.controller'
import { UserAdminGetListReqDTO } from './dtos/user-admin-get-list-req.dto'
import { UserAdminGetReqDTO } from './dtos/user-admin-get-req.dto'
import { AuthAdminMiddleware } from '../../admin/auth/auth-admin.middleware'

@Service()
export class UserAdminRoute implements BaseRoute {
    route?: string = 'users'
    router: Router = Router()

    constructor(
        @Inject() private userAdminController: UserAdminController,
        @Inject() private authAdminMiddleware: AuthAdminMiddleware
    ) {
        this.initRoutes()
    }

    private initRoutes() {
        // middleware
        this.router.use(
            '',
            this.authAdminMiddleware.authorize.bind(this.authAdminMiddleware)
        )

        // get users
        this.router.get(
            '',
            transformAndValidate(UserAdminGetListReqDTO),
            this.userAdminController.getUsers.bind(this.userAdminController)
        )

        // get user by id
        this.router.get(
            '/:userId',
            transformAndValidate(UserAdminGetReqDTO),
            this.userAdminController.getUser.bind(this.userAdminController)
        )

        // update redis leaderboard
        this.router.post(
            '/redis-leaderboard',
            this.userAdminController.updateRedisLeaderboard.bind(
                this.userAdminController
            )
        )
    }
}
