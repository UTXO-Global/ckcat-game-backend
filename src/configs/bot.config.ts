import { IsString } from 'class-validator'

export class BotConfig {
    @IsString()
    title: string

    @IsString()
    url: string
}
