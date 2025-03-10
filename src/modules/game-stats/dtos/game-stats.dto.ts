import { Expose } from 'class-transformer'
import { BaseReqDTO } from '../../../base/base.dto'

export class GameStatsDTO extends BaseReqDTO {
    @Expose()
    statsDate: Date

    @Expose()
    totalCreatedUsers: number

    @Expose()
    totalActiveUsers: number
}
