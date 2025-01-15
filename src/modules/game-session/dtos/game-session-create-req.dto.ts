import { Expose } from 'class-transformer'
import { IsInt } from 'class-validator'
import { BaseReqDTO } from '../../../base/base.dto'

export class GameSessionCreateReqDTO extends BaseReqDTO {
    @Expose()
    @IsInt()
    duration: number

    @Expose()
    userId: string
}
