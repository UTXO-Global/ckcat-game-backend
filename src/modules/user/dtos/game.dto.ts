import { Expose } from 'class-transformer'
import { BaseReqDTO } from '../../../base/base.dto'

export class GameDTO extends BaseReqDTO {
    @Expose()
    data: string
}
