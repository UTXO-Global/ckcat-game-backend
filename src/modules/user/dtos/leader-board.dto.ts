import { Expose } from 'class-transformer'
import { BaseReqDTO } from '../../../base/base.dto'

export class LeaderBoardDTO extends BaseReqDTO {
    @Expose()
    firstName: string

    @Expose()
    lastName: string

    @Expose()
    username: string

    @Expose()
    coin: number

    @Expose()
    rank: number
}
