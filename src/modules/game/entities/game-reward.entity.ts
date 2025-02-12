import { AppDataSource } from './../../../database/connection';
import { Column, Entity, EntityManager, ObjectId, ObjectIdColumn } from "typeorm"
import { AppBaseEntity } from "../../../base/base.entity"
import { GameRewardDTO } from "../dtos/game-reward.dto"
import { plainToInstance } from 'class-transformer';
import { level } from 'winston';

@Entity()
export class GameReward extends AppBaseEntity {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    userId: string

    @Column()
    level: number

    @Column()
    isReward: boolean

    @Column()
    rewardAt: Date

    static async createGameReward(
        data: GameRewardDTO,
        manager: EntityManager = AppDataSource.manager
    ) {
        const existingReward = await manager.findOne(GameReward, {
            where: { userId: data.userId, level: data.level },
        })
    
        if (existingReward) {
            return existingReward
        }
    

        const createFields = plainToInstance(GameRewardDTO, data, {
            excludeExtraneousValues: true,
        })
    
        return await manager.save(
            GameReward.create({
                ...createFields,
                isReward: false
            })
        )
    }

    static async getListGameReward(limit?: number){
        const repo = AppDataSource.getMongoRepository(GameReward);
    
        const pipeline: any[] = [];
    
        const limitNumber = limit ? limit : 10 

        pipeline.push(
            { $match: { isReward: false}},
            { $sort: { createdAt: -1 } },
            { $limit: limitNumber },
            {
                $lookup: {
                    from: 'user',
                    localField: 'userId',
                    foreignField: 'id',
                    as: 'user'
                }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    username: '$user.username',
                    level: 1,
                    isReward: 1,
                    createdAt: 1
                }
            }
        );
    
        return await repo.aggregate(pipeline).toArray();
    }
    

}
