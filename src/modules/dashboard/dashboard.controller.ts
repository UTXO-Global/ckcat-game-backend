import { NextFunction, Response } from 'express'
import { Inject, Service } from 'typedi'
import { ResponseWrapper } from '../../utils/response'
import { DataRequest } from '../../base/base.request'
import { DashboardGetListNewPlayerReqDTO } from './dtos/dashboard-get-list-new-player.dto'
import { DashboardRepos } from './repos/dashboard.repos'
import { DashboardGetListActivePlayerReqDTO } from './dtos/dashboad-get-list-active-player.dto'
import { DashboardGetNumOfPlayerReqDTO } from './dtos/dashboad-get-num-of-player.dto'
import { DashboardGetNumOfWalletReqDTO } from './dtos/dashboad-get-num-of-wallet.dto'
import { DashBoardService } from './dashboard.service'

@Service()
export class DashboardController {
    constructor(@Inject() private dashboardService: DashBoardService) {}
    async getNewPlayers(
        req: DataRequest<DashboardGetListNewPlayerReqDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { data } = req

            const { chartItems, pagination } =
                await this.dashboardService.getNewPlayers(data)

            res.send(new ResponseWrapper(chartItems, null, pagination))
        } catch (error) {
            next(error)
        }
    }

    async getActivePlayers(
        req: DataRequest<DashboardGetListActivePlayerReqDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { data } = req

            const { chartItems, pagination } =
                await this.dashboardService.getActivePlayers(data)
            res.send(new ResponseWrapper(chartItems, null, pagination))
        } catch (error) {
            next(error)
        }
    }

    async getNumOfPlayers(
        req: DataRequest<DashboardGetNumOfPlayerReqDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { data } = req

            const chartItems = await this.dashboardService.getNumOfPlayers(data)

            res.send(new ResponseWrapper(chartItems))
        } catch (error) {
            next(error)
        }
    }

    async getNumOfWallets(
        req: DataRequest<DashboardGetNumOfWalletReqDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { data } = req

            const chartItems = await this.dashboardService.getNumOfWallets(data)

            res.send(new ResponseWrapper(chartItems))
        } catch (error) {
            next(error)
        }
    }
}
