import { Expose } from 'class-transformer'
import { BaseReqDTO } from '../../../../base/base.dto'
import { ArrayMaxSize, IsNumber, IsString } from 'class-validator'

export class GameRewardUpdateReqDTO extends BaseReqDTO {
    @Expose()
    @IsString({ each: true })
    @ArrayMaxSize(200)
    userIds: string[]

    @Expose()
    @IsNumber()
    level: number
}
