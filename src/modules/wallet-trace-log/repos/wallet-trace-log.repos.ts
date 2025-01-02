import { EntityManager } from 'typeorm'
import { AppDataSource } from '../../../database/connection'
import { WalletTraceLogCreateReqDTO } from '../dtos/wallet-trace-log-create.dto'
import { WalletTraceLog } from '../entities/wallet-trace-log.entity'

export const WalletTraceLogRepos = AppDataSource.getRepository(
    WalletTraceLog
).extend({
    async createTraceLog(
        data: WalletTraceLogCreateReqDTO,
        manager: EntityManager
    ) {
        const record = await manager.save(
            WalletTraceLog.create({
                ...data,
            })
        )
        return record
    },
})
