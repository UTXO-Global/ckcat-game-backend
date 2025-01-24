import { Expose } from 'class-transformer'
import { BaseReqDTO } from '../../../base/base.dto'

export class UserRefreshTokenReqDTO extends BaseReqDTO {
    @Expose()
    refreshToken: string
}
