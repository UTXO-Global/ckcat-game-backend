import { Expose } from 'class-transformer'

export class GameSeasonDTO {
    @Expose()
    seasonId: string

    @Expose()
    totalPool: number

    @Expose()
    startDate: Date

    @Expose()
    endDate: Date
}
