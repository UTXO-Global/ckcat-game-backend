import { Expose } from 'class-transformer'
import { BaseReqDTO } from '../../../base/base.dto'

export class GenerateCustomTokenDTO extends BaseReqDTO {
    @Expose()
    userId: string
}
