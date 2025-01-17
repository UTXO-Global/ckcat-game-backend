import { Expose } from 'class-transformer'
import { IsOptional, IsString } from 'class-validator'
import { AuthReqDTO } from '../../../base/base.dto'

export class GameAirdropInfoGetListReqDTO extends AuthReqDTO {
    @Expose()
    @IsOptional()
    @IsString()
    sort: string
}
