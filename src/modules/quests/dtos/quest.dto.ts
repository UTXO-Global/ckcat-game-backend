import { Expose } from 'class-transformer'
import { BaseDTO } from '../../../base/base.dto'
import { Section } from '../types/sections.type'
import { PlatFormType } from '../types/platform.type'
import { CurrencyType } from '../types/currency.type'

export class QuestDTO extends BaseDTO {
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
}
