import { Expose } from 'class-transformer'
import { DataReqDTO } from '../../../base/base.dto'
import { IsOptional, IsString } from 'class-validator'

export class GameAirdropAdminGetListReqDTO extends DataReqDTO {
    @Expose()
    @IsOptional()
    @IsString()
    sort: string
}
