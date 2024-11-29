import { Expose } from 'class-transformer'
import { BaseReqDTO } from '../../../base/base.dto'

export class GameAirdropTransactionCreateReqDTO extends BaseReqDTO {
    @Expose()
    gameAirdropTransactionId: string

    @Expose()
    userId: string

    @Expose()
    gameAirdropId: string

    @Expose()
    paymentAmount: number

    @Expose()
    rewardAmount: number
}
