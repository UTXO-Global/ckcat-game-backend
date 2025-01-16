import { Expose } from 'class-transformer'
import { BaseReqDTO } from '../../../base/base.dto'

export class AdminLogInReqDTO extends BaseReqDTO {
    @Expose()
    email: string

    @Expose()
    password: string
}
