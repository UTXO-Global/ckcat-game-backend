import { Service } from 'typedi'
import { UserAdminGetListReqDTO } from './dtos/user-admin-get-list-req.dto'
import { UserAdminRepos } from './repos/user-admin.repos'
import { UserAdminGetReqDTO } from './dtos/user-admin-get-req.dto'

@Service()
export class UserAdminService {
    async getUsers(data: UserAdminGetListReqDTO) {
        return await UserAdminRepos.getUsers(data)
    }

    async getUser(data: UserAdminGetReqDTO) {
        return await UserAdminRepos.getUser(data)
    }
}
