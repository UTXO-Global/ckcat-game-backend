import { Expose } from 'class-transformer'
import { IsOptional, IsString } from 'class-validator'
import { AuthReqDTO } from '../../../base/base.dto'

export class GameAirdropGetDetailReqDTO extends AuthReqDTO {
    @Expose()
    @IsOptional()
    @IsString()
    gameAirdropId: string
}
