import { Expose } from 'class-transformer'
import { BaseReqDTO } from '../../../base/base.dto'

export class CheckInClaimRewardDTO extends BaseReqDTO {
    @Expose()
    checkInId: string

    @Expose()
    rewardCode: string

    @Expose()
    rewardValue: number
}
