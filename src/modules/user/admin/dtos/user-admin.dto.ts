import { Expose } from 'class-transformer'
import { BaseDTO } from '../../../../base/base.dto'

export class UserAdminDTO extends BaseDTO {
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

    @Expose()
    unlockTraining: number

    @Expose()
    lastLogin: Date

    @Expose()
    totalPlayingTime: number

    @Expose()
    totalLaunch: number

    @Expose()
    userWallet: object
}
