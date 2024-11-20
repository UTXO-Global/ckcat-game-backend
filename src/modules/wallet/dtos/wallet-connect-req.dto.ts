import { Expose } from 'class-transformer'
import { BaseReqDTO } from '../../../base/base.dto'

export class WalletConnectionDTO extends BaseReqDTO {
    @Expose()
    userId: string

    @Expose()
    address: string

    constructor(userId: string, address: string) {
        super()
        this.userId = userId
        this.address = address
    }
}
