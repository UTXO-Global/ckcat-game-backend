import { Expose } from 'class-transformer'

export class NewPlayerDTO {
    @Expose()
    username: string

    @Expose()
    firstName: string

    @Expose()
    lastName: string
}
