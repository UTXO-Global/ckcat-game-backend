import { Expose } from 'class-transformer'
import { BaseReqDTO } from '../../../base/base.dto'
import { IsString } from 'class-validator'

export class BuyItemByTypeReqDTO extends BaseReqDTO {
    @Expose()
    userId: string

    @Expose()
    @IsString()
    itemId: string
}
