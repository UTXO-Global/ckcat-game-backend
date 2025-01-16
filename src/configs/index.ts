import {
    IsNotEmpty,
    IsNumber,
    IsString,
    ValidateNested,
    validateSync,
} from 'class-validator'
import Container, { Service } from 'typedi'
import { Type, plainToInstance } from 'class-transformer'
import { JwtConfig } from './jwt.config'
import { MongoDbConfig } from './mongodb.config'
import { AwsConfig } from './aws.config'
import { BotConfig } from './bot.config'
import { DecryptDataConfig } from './decrypt-data.config'

@Service()
export class Config {
    @IsString()
    @IsNotEmpty()
    nodeEnv: string

    @IsString()
    @IsNotEmpty()
    appEnv: string

    @IsString()
    @IsNotEmpty()
    runEnv: string

    @IsNumber()
    @IsNotEmpty()
    port: number

    @ValidateNested()
    @Type(() => MongoDbConfig)
    masterDb: MongoDbConfig

    @IsString()
    @IsNotEmpty()
    redisUri: string

    @ValidateNested()
    @Type(() => BotConfig)
    bot: BotConfig

    @ValidateNested()
    @Type(() => JwtConfig)
    jwt: JwtConfig

    @IsString()
    @IsNotEmpty()
    telegramTokenBot: string

    @IsString()
    basicAuthPassword: string

    @ValidateNested()
    @Type(() => AwsConfig)
    awsConfig: AwsConfig

    @IsString()
    @IsNotEmpty()
    secretKey: string

    @IsString()
    @IsNotEmpty()
    ivKey: string

    @IsNumber()
    @IsNotEmpty()
    expireNonce: number

    @IsString()
    @IsNotEmpty()
    ckAddress: string

    @IsString()
    @IsNotEmpty()
    ckbURL: string

    @IsString()
    @IsNotEmpty()
    ckCodeHash: string

    @IsString()
    @IsNotEmpty()
    ckHashType: string

    @IsString()
    @IsNotEmpty()
    ckArgs: string

    @IsString()
    @IsNotEmpty()
    apiUrl: string

    @IsString()
    @IsNotEmpty()
    apiKey: string

    @ValidateNested()
    @Type(() => DecryptDataConfig)
    decryptDataConfig: DecryptDataConfig

    constructor() {
        const env = process.env
        this.nodeEnv = env.NODE_ENV
        this.appEnv = env.APP_ENV
        this.runEnv = env.RUN_ENV
        this.port = parseInt(env.PORT)
        this.masterDb = this.decodeStringObj(env.MASTER_DB)
        this.redisUri = this.decodeObjToStringRedis(env.REDIS)
        this.bot = this.decodeStringObj(env.BOT)
        this.jwt = this.decodeStringObj(env.JWT)
        this.telegramTokenBot = env.TELEGRAM_BOT_TOKEN
        this.basicAuthPassword = env.BASIC_AUTH_PASSWORD
        this.awsConfig = this.decodeStringObj(env.AWS_CREDENTIALS)
        this.secretKey = env.SECRET_KEY
        this.ivKey = env.IV_KEY
        this.expireNonce = parseInt(env.EXPIRES_NONCE)
        this.ckAddress = env.CK_ADDRESS
        this.ckbURL = env.CKB_URL
        this.ckCodeHash = env.CK_CODE_HASH
        this.ckHashType = env.CK_HASH_TYPE
        this.ckArgs = env.CK_ARGS
        this.apiUrl = env.API_URL
        this.apiKey = env.API_KEY
        this.decryptDataConfig = this.decodeStringObj(env.DECRYPT_DATA_CONFIG)
    }

    isProductionNodeEnv() {
        return this.nodeEnv === 'production'
    }

    private decodeStringObj(str: string) {
        return JSON.parse(str.replace(/\\/g, ''))
    }

    private decodeObjToStringRedis(str: string) {
        const json = this.decodeStringObj(str)
        const { host, port } = json
        return `redis://${host}:${port}`
    }
}

export const validateEnv = (config: Config) => {
    const errors = validateSync(plainToInstance(Config, config))
    if (errors.length) {
        const childErrors = errors.map((e) => e.children).flat()
        const constraints = [...errors, ...childErrors].map(
            (e) => e.constraints
        )
        throw new Error(`Env validation error: ${JSON.stringify(constraints)}`)
    }
}

export const config = Container.get(Config)
