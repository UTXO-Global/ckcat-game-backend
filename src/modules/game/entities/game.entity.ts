import {
    Column,
    Entity,
    EntityManager,
    ObjectId,
    ObjectIdColumn,
} from 'typeorm'
import { AppBaseEntity } from '../../../base/base.entity'
import { AppDataSource } from '../../../database/connection'
import { plainToInstance } from 'class-transformer'
import { GameDTO } from '../dtos/game.dto'
import { decryptData, getNowUtc } from '../../../utils'
import Container from 'typedi'
import { Config } from '../../../configs'
import { validateOrReject } from 'class-validator'
import { Errors } from '../../../utils/error'

@Entity()
export class Game extends AppBaseEntity {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    userId: string

    @Column()
    data: string

    static async createGame(
        data: GameDTO,
        manager: EntityManager = AppDataSource.manager
    ) {
        const createFields = plainToInstance(GameDTO, data, {
            excludeExtraneousValues: true,
        })

        const userId = data.userId

        const res = await Game.findOne({
            where: {
                userId: userId,
            },
        })

        if (!res) {
            return await manager.save(
                Game.create({
                    ...createFields,
                })
            )
        }

        await manager.update(
            Game,
            { userId: userId },
            { data: data.data, updatedAt: getNowUtc() }
        )
        return await Game.findOne({
            where: {
                userId: userId,
            },
        })
    }

    static async getGame(userId: string) {
        return await Game.findOne({
            where: {
                userId: userId,
            },
        })
    }

    static async getDecryptedGameData(userId: string) {
        try {
            // Fetch the game data by userId
            const game = await Game.findOne({ where: { userId } })
            if (!game) {
                throw Errors.GameNotFound
            }
            const config = Container.get(Config)

            // Extract the secret key and IV key
            const { secretKeyDecrypt, ivKeyDecrypt } = config.decryptDataConfig

            // Decrypt the game data
            const decryptedData = decryptData(
                game.data,
                secretKeyDecrypt,
                ivKeyDecrypt
            )

            // Decode Base64 string to UTF-8
            const decodedData = Buffer.from(decryptedData, 'base64').toString(
                'utf8'
            )

            // Validate the GameDTO object
            await validateOrReject(JSON.parse(decodedData))

            // Parse the decoded data
            const parsedData = JSON.parse(decodedData)
            const totalItems = parsedData?.items.length

            // Extract the BossCount
            const bossCountItem = parsedData?.items.find(
                (item: any) => item.key === 'BossCount'
            )

            const bossCount = bossCountItem ? bossCountItem.valueInt : 0

            return bossCount
        } catch (error) {
            console.error('Error during data decryption and validation:', error)
            throw new Error('Invalid game data')
        }
    }
}
