import { Router } from 'express'
import { Inject, Service } from 'typedi'
import { BaseRoute } from '../../app'
import { AuthMiddleware } from '../auth/auth.middleware'
import { PackageController } from './package.controller'

@Service()
export class PackageRoute implements BaseRoute {
    route?: string = 'package'
    router: Router = Router()

    constructor(
        @Inject() private packageController: PackageController,
        @Inject() private authMiddleware: AuthMiddleware
    ) {
        this.initRoutes()
    }

    private initRoutes() {
        this.router.get(
            '/packages',
            this.packageController.getPackages.bind(this.packageController)
        )
    }
}
