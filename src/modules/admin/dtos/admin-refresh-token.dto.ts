import { Expose } from 'class-transformer'
import { BaseReqDTO } from '../../../base/base.dto'

export class AdminRefreshTokenReqDTO extends BaseReqDTO {
    @Expose()
    token: string
}
