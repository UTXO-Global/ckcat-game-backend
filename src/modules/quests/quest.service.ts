import { Inject, Service } from 'typedi'
import { CacheKeys, CacheManager, CacheTimes } from '../../cache'
import { QuestUserTaskGetListDTO } from './dtos/quest-user-task-get-list.dto'
import { startTransaction } from '../../database/connection'
import { QuestUserTaskRepos } from './repos/quest-user-task.repos'
import { QuestGetListReqDTO } from './dtos/quest-get-list.dto'

@Service()
export class QuestService {
    constructor(@Inject() private cacheManager: CacheManager) {}
    async getListQuest(data: QuestGetListReqDTO) {
        const { userId, pagination } = data
        return await startTransaction(async (manager) => {
            const cached = await this.cacheManager.getObject<
                QuestUserTaskGetListDTO[]
            >(CacheKeys.gameQuestTask(userId))
            if (cached) return cached

            const list = await QuestUserTaskRepos.getListQuestUserTask(
                data,
                manager
            )

            await this.cacheManager.setObject(
                CacheKeys.gameQuestTask(userId),
                list,
                CacheTimes.day(30)
            )
            return list
        })
    }
}
