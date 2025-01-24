import { DashboardGetNumOfWalletReqDTO } from './dtos/dashboad-get-num-of-wallet.dto'
import { Service } from 'typedi'
import { DashboardGetListNewPlayerReqDTO } from './dtos/dashboard-get-list-new-player.dto'
import { DashboardRepos } from './repos/dashboard.repos'
import { DashboardGetNumOfPlayerReqDTO } from './dtos/dashboad-get-num-of-player.dto'

@Service()
export class DashBoardService {
    async getNewPlayers(data: DashboardGetListNewPlayerReqDTO) {
        return await DashboardRepos.getNewPlayers(data)
    }

    async getActivePlayers(data: DashboardGetListNewPlayerReqDTO) {
        return await DashboardRepos.getActivePlayers(data)
    }

    async getNumOfPlayers(data: DashboardGetNumOfPlayerReqDTO) {
        return await DashboardRepos.getNumOfPlayers(data)
    }

    async getNumOfWallets(data: DashboardGetNumOfWalletReqDTO) {
        return await DashboardRepos.getNumOfWallets(data)
    }
}
