import { Expose } from 'class-transformer'
import { BaseDTO } from '../../../base/base.dto'

export class UserDTO extends BaseDTO {
    @Expose()
    id: string

    @Expose()
    firstName: string

    @Expose()
    lastName: string

    @Expose()
    username: string

    @Expose()
    gems: number
}
