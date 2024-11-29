import { Expose } from 'class-transformer'
import { BaseDTO } from '../../../base/base.dto'
import { PlatFormType } from '../types/platform.type'
import { Section } from '../types/sections.type'
import { CurrencyType } from '../types/currency.type'

export class QuestUserTaskGetListDTO extends BaseDTO {
    @Expose()
    userId: string

    @Expose()
    questId: number

    @Expose()
    questName: string

    @Expose()
    currencyType: CurrencyType

    @Expose()
    reward: number

    @Expose()
    platform: PlatFormType

    @Expose()
    description: string

    @Expose()
    link: string

    @Expose()
    section: Section

    @Expose()
    isClaimTask: boolean

    @Expose()
    isClaimDailyTask: Date
}
