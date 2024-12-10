import { Expose } from 'class-transformer'
import { BaseReqDTO } from '../../../base/base.dto'

export class CheckInDTO extends BaseReqDTO {
    @Expose()
    checkInId: string

    @Expose()
    userId: string

    @Expose()
    checkInDate: Date

    @Expose()
    currentStreak: number
}
