import { IsString } from 'class-validator'

export class DecryptDataConfig {
    @IsString()
    secretKeyDecrypt: string

    @IsString()
    ivKeyDecrypt: string
}
