import { Expose } from 'class-transformer'
import { BaseReqDTO } from '../../../base/base.dto'
import { IsOptional } from 'class-validator'

export class InternalLeaderboardReqDTO extends BaseReqDTO {
    @Expose()
    userId: string

    @Expose()
    @IsOptional()
    page?: number

    @Expose()
    @IsOptional()
    limit?: number
}
