import { Expose } from 'class-transformer'
import { DataReqDTO } from '../../../base/base.dto'
import { IsOptional, IsString } from 'class-validator'

export class GameAirdropGetListReqDTO extends DataReqDTO {
    @Expose()
    userId: string

    @Expose()
    @IsOptional()
    @IsString()
    sort: string
}
