import { Expose, Transform } from 'class-transformer'
import { IsInt } from 'class-validator'
import { BaseReqDTO } from '../../../../base/base.dto'
import { ToInt } from '../../../../utils/transform'

export class UserAdminGetReqDTO extends BaseReqDTO {
    @Expose()
    @Transform(ToInt)
    @IsInt()
    userId: number
}
