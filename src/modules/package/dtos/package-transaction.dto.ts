import { BaseReqDTO } from '../../../base/base.dto'
import { Expose } from 'class-transformer'

export class PackageTransactionDTO extends BaseReqDTO {
    @Expose()
    userId: string

    @Expose()
    packageId: string

    @Expose()
    orderId: string

    @Expose()
    purchaseID: string

    @Expose()
    expired: number
}
