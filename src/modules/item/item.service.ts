import { Inject, Service } from 'typedi'
import { Item } from './entities/item.entity'
import { GetItemByTypeReqDTO } from './dtos/item-get-by-type.dto'
import { BuyItemByTypeReqDTO } from './dtos/item-buy-by-type.dto'
import { startTransaction } from '../../database/connection'
import { Gems } from '../gems/entities/gems.entity'
import { GemsService } from '../gems/gems.service'
import { ItemTypes } from './types/item.type'
import { User } from '../user/entities/user.entity'
import { Errors } from '../../utils/error'

@Service()
export class ItemService {
    constructor(@Inject() private gemsService: GemsService) {}

    async getItems(data: GetItemByTypeReqDTO) {
        return await Item.getItems(data.type)
    }

    async updateGemsByItem(data: BuyItemByTypeReqDTO) {
        return await startTransaction(async (manager) => {
            const user = await User.getUser(data.userId)
            if (!user) throw Errors.UserNotFound

            const item = await Item.getItem(data.itemId)
            if (!item) return

            if (user.gems < item.gems) {
                throw Errors.NotEnoughGems
            }

            await this.gemsService.gemsHistory({
                userId: data.userId,
                type: item.key,
                gems: -item.gems,
            })
            // if (item.type === ItemTypes.Boost) {
            //     await this.gemsService.gemsHistory({
            //         userId: data.userId,
            //         type: item.key,
            //         gems: -item.gems,
            //     })
            //     return
            // }
            // const gems = await Gems.getGemsByType(data.userId, item.key);
            // if(!gems) {
            //     await this.gemsService.gemsHistory({
            //         userId: data.userId,
            //         type: item.key,
            //         gems: -item.gems,
            //     })
            // }
        })
    }

    async getUserSlot(userId: string) {
        let slot = 0
        const slot1 = await Gems.getGemsByType(userId, ItemTypes.Slot1)
        if (slot1) {
            slot = 1
        }
        const slot2 = await Gems.getGemsByType(userId, ItemTypes.Slot2)
        if (slot2) {
            slot = 2
        }

        return slot
    }
}
