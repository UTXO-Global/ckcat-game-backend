import { Expose } from 'class-transformer'

export class BotSettingDTO {
    @Expose()
    settingId: string

    @Expose()
    settingKey: number

    @Expose()
    value: number

    @Expose()
    content: string

    @Expose()
    urlImage: string

    @Expose()
    buttons: { text: string; url: string }[]
}
