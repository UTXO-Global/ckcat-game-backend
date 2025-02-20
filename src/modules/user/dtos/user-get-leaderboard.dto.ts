import { Expose } from 'class-transformer'
import { DataReqDTO } from '../../../base/base.dto'

export class UserGetLeaderboardReqDTO extends DataReqDTO {
    @Expose()
    userId: string
}
