import { Expose } from 'class-transformer'
import { DataReqDTO } from '../../../base/base.dto'
import { IsOptional, IsString } from 'class-validator'

export class GameAirdropGetDetailReqDTO extends DataReqDTO {
    @Expose()
    @IsOptional()
    @IsString()
    gameAirdropId: string

    @Expose()
    userId: string
}
