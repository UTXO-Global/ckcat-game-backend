import { BaseReqDTO } from '../../../base/base.dto'
import { Expose } from 'class-transformer'

export class GameDTO extends BaseReqDTO {
    @Expose()
    userId: string

    @Expose()
    data: string

    init(data: GameDTO) {
        this.userId = data.userId
        this.data = data.data
    }
}
