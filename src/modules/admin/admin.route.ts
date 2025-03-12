import { AuthAdminMiddleware } from './auth/auth-admin.middleware'
import { Inject, Service } from 'typedi'
import { BaseRoute } from '../../app'
import { Router } from 'express'
import { AdminController } from './admin.controller'
import { transformAndValidate } from '../../utils/validator'
import { AdminLogInReqDTO } from './dtos/admin-log-in.dto'
import { AdminLogOutReqDTO } from './dtos/admin-log-out.dto'
import { AdminRefreshTokenReqDTO } from './dtos/admin-refresh-token.dto'
import { AuthCMSReqDTO } from '../../base/base.dto'
import { AuthAdminService } from './auth/auth-admin.service'
import { AuthMiddleware } from '../auth/auth.middleware'
import { AdminDTO } from './dtos/admin.dto'

@Service()
export class AdminRoute implements BaseRoute {
    route?: string = 'auth'
    router: Router = Router()

    constructor(
        @Inject() private adminController: AdminController,
        @Inject() private authAdminMiddleware: AuthAdminMiddleware,
        @Inject() private authMiddleware: AuthMiddleware
    ) {
        this.initRoutes()
    }

    private initRoutes() {
        this.router.post(
            '/login',
            transformAndValidate(AdminLogInReqDTO),
            this.adminController.logIn.bind(this.adminController)
        )

        this.router.post(
            '/logout',
            transformAndValidate(AdminLogOutReqDTO),
            this.adminController.logOut.bind(this.adminController)
        )

        this.router.post(
            '/refresh-token',
            transformAndValidate(AdminRefreshTokenReqDTO),
            this.adminController.refreshToken.bind(this.adminController)
        )

        this.router.get(
            '/profile',
            this.authAdminMiddleware.authorize.bind(this.authAdminMiddleware),
            transformAndValidate(AuthCMSReqDTO),
            this.adminController.getProfile.bind(this.adminController)
        )

        this.router.post(
            '/admin',
            this.authMiddleware.authorizeApiKey.bind(this.authMiddleware),
            transformAndValidate(AdminDTO),
            this.adminController.createAdmin.bind(this.adminController)
        )
    }
}
