import { Column, Entity, EntityManager, ObjectIdColumn } from 'typeorm'
import { AppBaseEntity } from '../../../base/base.entity'
import { AppDataSource } from '../../../database/connection'
import { plainToInstance } from 'class-transformer'
import { ObjectId } from 'mongodb'
import { WalletDTO } from '../dtos/wallet.dto'
import { getNowUtc, randomID } from '../../../utils'
import { WalletTraceLogRepos } from '../../wallet-trace-log/repos/wallet-trace-log.repos'
import { WalletTask } from '../../wallet-trace-log/types/wallet-task.type'

@Entity()
export class UserWallet extends AppBaseEntity {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    userId: string

    @Column()
    address: string

    @Column({ nullable: true })
    createdDateWallet: Date

    @Column({ nullable: true })
    updatedDateWallet: Date

    static async createUserWallet(
        data: WalletDTO,
        manager: EntityManager = AppDataSource.manager
    ) {
        const createFields = plainToInstance(WalletDTO, data, {
            excludeExtraneousValues: true,
        })

        const wallet = await UserWallet.findOne({
            where: {
                userId: data.userId,
                address: data.address,
            },
        })

        if (!wallet) {
            return await manager.save(
                UserWallet.create({
                    ...createFields,
                })
            )
        }
    }

    static async getWalletByUserId(userId: string) {
        return await UserWallet.findOne({
            where: {
                userId,
            },
        })
    }

    static async upsertUserWallet(
        data: WalletDTO,
        manager: EntityManager = AppDataSource.manager
    ) {
        const existingWallet = await UserWallet.findOne({
            where: { userId: data.userId },
        })
        const now = getNowUtc()

        if (!existingWallet) {
            // Tạo mới nếu chưa tồn tại
            const newWallet = UserWallet.create({
                ...plainToInstance(WalletDTO, data, {
                    excludeExtraneousValues: true,
                }),
                createdDateWallet: new Date(now),
                updatedDateWallet: new Date(now),
            })
            await WalletTraceLogRepos.createTraceLog(
                {
                    traceLogId: randomID(),
                    userId: data.userId,
                    walletAddress: data.address,
                    walletTask: WalletTask.ImportAddress,
                },
                manager
            )
            return await manager.save(newWallet)
        } else {
            // Cập nhật nếu đã tồn tại
            existingWallet.address = data.address

            if (existingWallet.createdDateWallet) {
                existingWallet.updatedDateWallet = new Date(now)
            } else {
                existingWallet.createdDateWallet = new Date(now)
                existingWallet.updatedDateWallet = new Date(now)
            }
            await WalletTraceLogRepos.createTraceLog(
                {
                    traceLogId: randomID(),
                    userId: data.userId,
                    walletAddress: data.address,
                    walletTask: WalletTask.ImportAddress,
                },
                manager
            )
            return await manager.save(existingWallet)
        }
    }
}
