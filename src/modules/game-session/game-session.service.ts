import { Service } from 'typedi'
import { GameSessionCreateReqDTO } from './dtos/game-session-create-req.dto'
import { startTransaction } from '../../database/connection'
import { GameSession } from './entities/game-session.entity'

@Service()
export class GameSessionService {
    async createSession(data: GameSessionCreateReqDTO) {
        return await startTransaction(async (manager) => {
            return await GameSession.createGameSession(data, manager)
        })
    }
}
