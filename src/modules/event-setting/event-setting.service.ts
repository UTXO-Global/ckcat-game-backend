import { Service } from 'typedi'
import { EventSettingGetByKeyReqDTO } from './dtos/event-setting-get-by-key.dto'
import { EventSetting } from './entities/event-setting.entity'

@Service()
export class EventSettingService {
    async getEventSettingByKey(data: EventSettingGetByKeyReqDTO) {
        return await EventSetting.getEventSettingByKey(data.key)
    }
}
