import { Expose } from 'class-transformer'
import { BaseReqDTO } from '../../../base/base.dto'

export class GameSeasionGetDTO extends BaseReqDTO {
    @Expose()
    dateTime: Date
}
