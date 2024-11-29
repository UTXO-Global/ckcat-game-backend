import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm'
import { AppBaseEntity } from '../../../base/base.entity'
import { PlatFormType } from '../types/platform.type'
import { Section } from '../types/sections.type'
import { CurrencyType } from '../types/currency.type'

@Entity()
export class Quest extends AppBaseEntity {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    questId: number

    @Column()
    questName: string

    @Column()
    currencyType: CurrencyType

    @Column()
    reward: number

    @Column()
    platform: PlatFormType

    @Column()
    description: string

    @Column()
    link: string

    @Column()
    section: Section
}
