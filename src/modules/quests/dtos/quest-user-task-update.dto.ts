import { Expose } from 'class-transformer'
import { BaseDTO } from '../../../base/base.dto'

export class QuestUserTaskUpdateReqDTO {
    @Expose()
    userId: string

    @Expose()
    questId: number
}

export class QuestUserDailyTaskUpdateReqDTO {
    @Expose()
    userId: string

    @Expose()
    questId: number

    @Expose()
    isClaimDailyTask: Date
}
