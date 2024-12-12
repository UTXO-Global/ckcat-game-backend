import { Service } from 'typedi'
import { startTransaction } from '../../database/connection'
import { GemsDTO } from './dtos/gems.dto'
import { Gems } from './entities/gems.entity'
import { plainToInstance } from 'class-transformer'
import { User } from '../user/entities/user.entity'
import { Errors } from '../../utils/error'

@Service()
export class GemsService {

    async gemsHistory(data: GemsDTO) {
        return await startTransaction(async (manager) => {
            const user = await User.getUser(data.userId)
            if ((data.gems < 0) && user.gems < Math.abs(data.gems)) 
            {
                throw Errors.EventSettingNotFound
            }
            await Gems.createGems(plainToInstance(GemsDTO, data), manager)
            await User.updateGems(plainToInstance(GemsDTO, data), manager)
        })
    }

    static async crawlGemsHistory(data: GemsDTO) {
        return await startTransaction(async (manager) => {
            await Gems.createGems(plainToInstance(GemsDTO, data), manager)
            await User.updateGems(plainToInstance(GemsDTO, data), manager)
        })
    }
}
