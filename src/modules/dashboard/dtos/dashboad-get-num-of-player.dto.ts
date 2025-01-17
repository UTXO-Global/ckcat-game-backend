import { Expose, Transform } from 'class-transformer'
import { IsInt, IsISO8601 } from 'class-validator'
import { DataReqDTO } from '../../../base/base.dto'
import { ToInt } from '../../../utils/transform'

export class DashboardGetNumOfPlayerReqDTO extends DataReqDTO {
    @Expose()
    @IsISO8601()
    fromDate: Date

    @Expose()
    @IsISO8601()
    toDate: Date

    @Expose()
    @IsInt()
    @Transform(ToInt)
    type: number
}
