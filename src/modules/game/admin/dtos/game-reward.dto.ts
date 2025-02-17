import { BaseReqDTO } from '../../../../base/base.dto'
import { Expose } from 'class-transformer'

export class GameRewardDTO extends BaseReqDTO {
    @Expose()
    userId: string

    @Expose()
    level: number

}
