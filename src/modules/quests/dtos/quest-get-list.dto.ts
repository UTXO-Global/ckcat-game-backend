import { Expose } from 'class-transformer'
import { DataReqDTO } from '../../../base/base.dto'

export class QuestGetListReqDTO extends DataReqDTO {
    @Expose()
    userId: string
}
