import { Expose } from 'class-transformer'
import { BaseReqDTO } from '../../../base/base.dto'

export class GameAirdropJoinReqDTO extends BaseReqDTO {
    @Expose()
    gameAirdropId: string

    @Expose()
    userId: string
}
