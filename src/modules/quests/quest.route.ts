import { Inject, Service } from 'typedi'
import { BaseRoute } from '../../app'
import { Router } from 'express'
import { QuestController } from './quest.controller'
import { AuthMiddleware } from '../auth/auth.middleware'
import { transformAndValidate } from '../../utils/validator'
import { QuestGetListReqDTO } from './dtos/quest-get-list.dto'

@Service()
export class QuestRoute implements BaseRoute {
    route?: string = 'quest'
    router: Router = Router()

    constructor(
        @Inject() private questController: QuestController,
        @Inject() private authMiddleware: AuthMiddleware
    ) {
        this.initRoute()
    }

    private initRoute() {
        this.router.use(
            '',
            this.authMiddleware.authorization.bind(this.authMiddleware)
        )

        // get list quest
        this.router.get(
            '/quests',
            transformAndValidate(QuestGetListReqDTO),
            this.questController.getListQuest.bind(this.questController)
        )
    }
}
