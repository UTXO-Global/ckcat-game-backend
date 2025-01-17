import { Expose } from 'class-transformer'
import { BaseReqDTO } from '../../../base/base.dto'

export class AdminLogOutReqDTO extends BaseReqDTO {
    @Expose()
    accessToken: string
}
