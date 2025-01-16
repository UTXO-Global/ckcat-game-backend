import { Expose, Transform } from 'class-transformer'
import { IsISO8601, IsOptional, IsString } from 'class-validator'
import { DataReqDTO } from '../../../base/base.dto'
import { ToBoolean, ToInt } from '../../../utils/transform'

export class DashboardGetListNewPlayerReqDTO extends DataReqDTO {
    @Expose()
    @IsOptional()
    @IsString()
    search: string

    @Expose()
    @IsOptional()
    @IsString()
    sort: string

    @Expose()
    @IsOptional()
    @IsString()
    filter: string

    @Expose()
    @IsISO8601()
    fromDate: Date

    @Expose()
    @IsISO8601()
    toDate: Date

    @Expose()
    @IsOptional()
    @Transform(ToBoolean)
    all: boolean

    @Expose()
    @Transform(ToInt)
    @IsOptional()
    start: boolean

    @Expose()
    @Transform(ToInt)
    @IsOptional()
    end: boolean
}
