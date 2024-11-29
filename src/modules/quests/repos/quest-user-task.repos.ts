import { EntityManager } from 'typeorm'
import { AppDataSource } from '../../../database/connection'
import { QuestUserTask } from '../entities/quest-user-task.entity'
import { Errors } from '../../../utils/error'
import { plainToInstance } from 'class-transformer'
import { QuestUserTaskDTO } from '../dtos/quest-user-task.dto'
import { Quest } from '../entities/quest.entity'
import { QuestUserTaskGetListDTO } from '../dtos/quest-user-task-get-list.dto'
import {
    QuestUserDailyTaskUpdateReqDTO,
    QuestUserTaskUpdateReqDTO,
} from '../dtos/quest-user-task-update.dto'
import Container from 'typedi'
import { CacheKeys, CacheManager, CacheTimes } from '../../../cache'
import { QuestGetListReqDTO } from '../dtos/quest-get-list.dto'

export const QuestUserTaskRepos = AppDataSource.getMongoRepository(
    QuestUserTask
).extend({
    async createQuestUserTask(userId: string, manager: EntityManager) {
        const quests = await manager.find(Quest)
        if (!quests || quests.length === 0) {
            throw Errors.QuestNotFound
        }

        const questUserTasks = quests.map((quest) => {
            const questUserTask = manager.create(QuestUserTask, {
                userId: userId,
                questId: quest.questId,
                isClaimTask: false,
                isClaimDailyTask: new Date(2000, 0, 1),
            })

            return questUserTask
        })

        await manager.save(questUserTasks)
        return plainToInstance(QuestUserTaskDTO, questUserTasks, {
            excludeExtraneousValues: true,
        })
    },

    async getListQuestUserTask(
        data: QuestGetListReqDTO,
        manager: EntityManager
    ) {
        const { userId, pagination } = data
        const existingTasks = await manager.find(QuestUserTask, {
            where: { userId },
        })

        if (!existingTasks || existingTasks.length === 0) {
            await this.createQuestUserTask(userId, manager)
        }
        const match = { userId }
        const pipeline: any[] = [
            { $match: match },

            {
                $lookup: {
                    from: 'quest',
                    localField: 'questId',
                    foreignField: 'questId',
                    as: 'questData',
                },
            },
            {
                $unwind: {
                    path: '$questData',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 1,
                    createdAt: 1,
                    userId: 1,
                    questId: 1,
                    isClaimTask: 1,
                    isClaimDailyTask: 1,
                    questName: '$questData.questName',
                    currencyType: '$questData.currencyType',
                    reward: '$questData.reward',
                    platform: '$questData.platform',
                    description: '$questData.description',
                    link: '$questData.link',
                    section: '$questData.section',
                },
            },
        ]

        const questUserTasks = await QuestUserTaskRepos.aggregate(
            pipeline
        ).toArray()

        return plainToInstance(QuestUserTaskGetListDTO, questUserTasks, {
            excludeExtraneousValues: true,
        })
    },

    async updateQuestTask(
        data: QuestUserTaskUpdateReqDTO,
        manager: EntityManager
    ) {
        const { userId, questId } = data
        await manager.update(
            QuestUserTask,
            { userId, questId },
            { isClaimTask: true }
        )

        const cacheManager = Container.get(CacheManager)
        const cacheKey = CacheKeys.gameQuestTask(userId)
        await cacheManager.del(cacheKey)

        const updatedList = await this.getListQuestUserTask(userId, manager)

        await cacheManager.setObject(cacheKey, updatedList, CacheTimes.day(30))
        return updatedList
    },

    async updateQuestDailyTask(
        data: QuestUserDailyTaskUpdateReqDTO,
        manager: EntityManager
    ) {
        const { userId, questId, isClaimDailyTask } = data
        await manager.update(
            QuestUserTask,
            { userId, questId },
            { isClaimDailyTask }
        )

        const cacheManager = Container.get(CacheManager)
        const cacheKey = CacheKeys.gameQuestTask(userId)
        await cacheManager.del(cacheKey)

        const updatedList = await this.getListQuestUserTask(userId, manager)

        await cacheManager.setObject(cacheKey, updatedList, CacheTimes.day(30))
        return updatedList
    },
})
