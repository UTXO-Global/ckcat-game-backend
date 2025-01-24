import { Inject, Service } from 'typedi'
import { WalletDTO } from './dtos/wallet.dto'
import { startTransaction } from '../../database/connection'
import { UserWallet } from './entities/user-wallet.entity'
import { GemsService } from '../gems/gems.service'
import { Gems } from '../gems/entities/gems.entity'
import { EventSettingKey } from '../event-setting/types/event-setting.type'
import { EventSetting } from '../event-setting/entities/event-setting.entity'
import { Errors } from '../../utils/error'

@Service()
export class WalletService {
    constructor(@Inject() private gemsService: GemsService) {}

    async connectWallet(data: WalletDTO) {
        return await startTransaction(async (manager) => {
            await UserWallet.upsertUserWallet(data, manager)
            const gems = await Gems.getGemsByType(
                data.userId,
                EventSettingKey.ConnectWallet
            )
            if (!gems) {
                const setting = await EventSetting.getEventSettingByKey(
                    EventSettingKey.ConnectWallet
                )
                if (!setting) throw Errors.EventSettingNotFound

                await this.gemsService.gemsHistory({
                    userId: data.userId,
                    type: setting.eventSettingKey,
                    gems: setting.gems,
                })
            }
        })
    }
}
