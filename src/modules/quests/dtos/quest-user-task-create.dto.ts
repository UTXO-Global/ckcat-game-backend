import { Expose, Transform } from 'class-transformer'
import { BaseDTO } from '../../../base/base.dto'
import { isISO8601 } from 'class-validator'

export class QuestUserTaskCreateReqDTO extends BaseDTO {
    @Expose()
    userId: string

    @Expose()
    questId: number

    @Expose()
    isClaimTask: boolean

    @Expose()
    @Transform(({ value }) => {
        if (value instanceof Date) {
            return value
        }
        const isValidDate = isISO8601(value, {
            strict: true,
            strictSeparator: true,
        })
        if (!isValidDate) {
            return new Date(2000, 0, 1)
        }
        return new Date(value)
    })
    isClaimDailyTask: Date
}
