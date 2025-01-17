import { BotSettingKey } from './../types/bot-setting.type'
import { AppDataSource } from '../../../database/connection'
import { BotSetting } from '../entities/bot-setting.entity'
import { Errors } from '../../../utils/error'
import { plainToInstance } from 'class-transformer'
import { BotSettingDTO } from '../dtos/bot-setting.dto'
import { BotSettingUpdateReqDTO } from '../dtos/bot-setting-update.dto'

export const BotSettingRepos = AppDataSource.getMongoRepository(
    BotSetting
).extend({
    async getSettingByKey(settingKey: BotSettingKey) {
        const setting = await this.findOneBy({
            settingKey,
        })

        if (!setting) {
            throw Errors.BotSettingNotFound
        }
        return plainToInstance(BotSettingDTO, setting, {
            excludeExtraneousValues: true,
        })
    },

    async updateSetting(data: BotSettingUpdateReqDTO) {
        // Lấy dữ liệu hiện tại
        const existingSetting = await this.findOneBy({
            settingKey: BotSettingKey.ContentBot,
        })

        if (!existingSetting) {
            throw Errors.BotSettingNotFound
        }

        // Chỉ cập nhật các trường có giá trị
        const updatedData = {
            ...existingSetting,
            ...(data.urlImage !== undefined && { urlImage: data.urlImage }),
            ...(data.content !== undefined && { content: data.content }),
            ...(data.buttons !== undefined && { buttons: data.buttons }),
        }

        // Lưu thay đổi
        return await this.save(updatedData)
    },
})
