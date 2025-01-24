import { Expose } from 'class-transformer'
import { DataReqDTO } from '../../../../base/base.dto'
import { IsISO8601, IsOptional, IsString } from 'class-validator'

export class UserAdminGetListTransactionReqDTO extends DataReqDTO {
    @Expose()
    @IsString()
    userId: string

    @Expose()
    @IsOptional()
    @IsString()
    filter: string

    @Expose()
    @IsOptional()
    @IsString()
    sort: string

    @Expose()
    @IsOptional()
    @IsISO8601()
    fromDate: Date

    @Expose()
    @IsOptional()
    @IsISO8601()
    toDate: Date
}
