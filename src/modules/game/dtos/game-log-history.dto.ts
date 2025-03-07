import { BaseReqDTO } from '../../../base/base.dto'
import { Expose } from 'class-transformer'

export class GameLogHistoryDTO extends BaseReqDTO {
    @Expose()
    userId: string

    @Expose()
    data: string
}
