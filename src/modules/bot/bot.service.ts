import { Markup } from 'telegraf'
import Container, { Inject, Service } from 'typedi'
import { BotUser } from './entities/bot-user.entity'
import { Config } from '../../configs'
import { Errors } from '../../utils/error'
import { User } from '../user/entities/user.entity'
import { BotSettingRepos } from './repos/bot-setting.repos'
import { BotSettingKey } from './types/bot-setting.type'
import { splitChunks } from '../../utils'
import { BotSettingGetDetailReqDTO } from './dtos/bot-setting-get-detail.dto'
import { BotSettingUpdateReqDTO } from './dtos/bot-setting-update.dto'
import { QueueManager, QueueName } from '../queue/queues'

@Service()
export class BotService {
    constructor(
        @Inject() private config: Config,
        @Inject() private queueManager: QueueManager
    ) {}
    // create dynamic keyboard
    private createDynamicKeyboard(buttons: { text: string; url: string }[]) {
        // Group buttons into rows of 2
        const keyboard = []
        for (let i = 0; i < buttons.length; i += 2) {
            const row = buttons.slice(i, i + 2) // Create a row with 2 buttons
            const rowButtons = row.map((button) =>
                Markup.button.url(button.text, button.url)
            )
            keyboard.push(rowButtons) // Add the row to the keyboard
        }
        return Markup.inlineKeyboard(keyboard)
    }

    async sendContent(
        userIds: string[],
        messageData: {
            urlImage: string
            content: string
            buttons: { text: string; url: string }[]
        }
    ) {
        const { urlImage, content, buttons } = messageData
        const chunkSize = 200
        if (!urlImage || !content) {
            console.warn('Missing image URL or content for the notification.')
            return
        }

        // create dynamic keyboard from list buttons
        const keyboard = this.createDynamicKeyboard(buttons)

        const userChunks = splitChunks(userIds, chunkSize)

        const queue = this.queueManager.createQueue(QueueName.bot)
        for (const chunk of userChunks) {
            for (const userId of chunk) {
                const user = await User.findOneBy({ id: userId })
                if (!user) {
                    continue
                }
                const usernameMention = user.username ? `@${user.username}` : ''

                // Replace @user with userName
                const personalizedContent = content.replace(
                    '@user',
                    usernameMention
                )

                await queue.add('push-content', {
                    userId,
                    urlImage,
                    content: personalizedContent,
                    reply_markup: keyboard.reply_markup,
                })
            }
        }
    }
    async getAllUserIds(): Promise<string[]> {
        const users = await BotUser.find()
        const userIds = users.map((user) => user.userId)
        return userIds
    }

    async sendContentBot() {
        const setting = await BotSettingRepos.getSettingByKey(
            BotSettingKey.ContentBot
        )

        const messageData = {
            urlImage: setting.urlImage,
            content: setting.content,
            buttons: setting.buttons,
        }

        const userIds = await this.getAllUserIds()
        if (!userIds || userIds.length === 0) {
            throw Errors.UserNotFound
        }

        await this.sendContent(userIds, messageData)

        return true
    }

    async getSettingByKey(data: BotSettingGetDetailReqDTO) {
        return await BotSettingRepos.getSettingByKey(data.settingKey)
    }

    async updateSetting(data: BotSettingUpdateReqDTO) {
        return await BotSettingRepos.updateSetting(data)
    }
}
