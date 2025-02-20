import { Expose, Transform } from 'class-transformer'
import { DataCMSReqDTO } from '../../../../base/base.dto'
import { ToNumber } from '../../../../utils/transform'

export class GameRewardGetListReqDTO extends DataCMSReqDTO {
    @Expose()
    @Transform(ToNumber)
    level: number
}
