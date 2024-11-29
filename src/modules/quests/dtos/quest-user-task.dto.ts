import { Expose, Transform } from 'class-transformer'
import { BaseDTO } from '../../../base/base.dto'
import { isISO8601 } from 'class-validator'

export class QuestUserTaskDTO extends BaseDTO {
    @Expose()
    userId: string

    @Expose()
    questId: number

    @Expose()
    isClaimTask: boolean

    @Expose()
    isClaimDailyTask: Date
}
