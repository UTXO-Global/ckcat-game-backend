import { Expose } from 'class-transformer'

export class ActivePlayerDTO {
    @Expose()
    userDetail: object

    @Expose()
    dayOfWeek: number

    @Expose()
    month: number

    @Expose()
    createdAt: Date
}
