import { Expose } from 'class-transformer'
import { BaseReqDTO } from '../../../base/base.dto'

export class UserGameAttributeDTO extends BaseReqDTO {
    @Expose()
    userId: string

    @Expose()
    amountBossKill: number

    @Expose()
    soul: number

    @Expose()
    catHighest: number
}
