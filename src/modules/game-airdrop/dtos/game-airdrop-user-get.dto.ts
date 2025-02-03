import { Expose } from 'class-transformer'
import { IsOptional, IsString } from 'class-validator'
import { AuthReqDTO, DataReqDTO } from '../../../base/base.dto'

export class GameAirdropUserGetReqDTO extends AuthReqDTO {
    @Expose()
    @IsOptional()
    @IsString()
    sort: string

    @Expose()
    @IsString()
    gameAirdropId: string
}
