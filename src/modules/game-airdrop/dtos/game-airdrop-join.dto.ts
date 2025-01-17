import { Expose } from 'class-transformer'
import { AuthReqDTO } from '../../../base/base.dto'

export class GameAirdropJoinReqDTO extends AuthReqDTO {
    @Expose()
    gameAirdropId: string
}
