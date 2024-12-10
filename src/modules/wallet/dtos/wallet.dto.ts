import { BaseReqDTO } from '../../../base/base.dto'
import { Expose } from 'class-transformer'

export class WalletDTO extends BaseReqDTO {
    @Expose()
    userId: string

    @Expose()
    address: string
}
