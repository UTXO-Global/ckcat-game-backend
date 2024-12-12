import { Expose } from 'class-transformer'
import { BaseReqDTO } from '../../../base/base.dto'
import { IsEnum } from 'class-validator'
import { ItemTypes } from '../types/item.type'

export class GetItemByTypeReqDTO extends BaseReqDTO {
    @Expose()
    @IsEnum(ItemTypes)
    type: ItemTypes
}
