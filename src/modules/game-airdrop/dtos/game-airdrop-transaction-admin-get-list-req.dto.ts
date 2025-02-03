import { Expose } from 'class-transformer'
import { DataReqDTO } from '../../../base/base.dto'
import { IsOptional, IsString } from 'class-validator'

export class GameAirdropTransactionAdminGetListReqDTO extends DataReqDTO {
    @Expose()
    @IsOptional()
    @IsString()
    sort: string

    @Expose()
    gameAirdropId: string
}
