import { Expose } from 'class-transformer'
import { BaseReqDTO } from '../../../base/base.dto'
import { WalletTask } from '../types/wallet-task.type'
import { IsEnum } from 'class-validator'

export class WalletTraceLogCreateReqDTO extends BaseReqDTO {
    @Expose()
    traceLogId: string

    @Expose()
    userId: string

    @Expose()
    walletAddress: string

    @Expose()
    @IsEnum(WalletTask)
    walletTask: WalletTask
}
