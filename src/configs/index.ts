import {
    IsNotEmpty,
    IsNumber,
    IsString,
    ValidateNested,
    validateSync,
} from 'class-validator'
import Container, { Service } from 'typedi'
import { Type, plainToInstance } from 'class-transformer'
import { RedisConfig } from './redis.config'
import { JwtConfig } from './jwt.config'
import { MongoDbConfig } from './mongodb.config'
import { AwsConfig } from './aws.config'
import { BotConfig } from './bot.config'

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

    @IsNumber()
    @IsNotEmpty()
    socketPort: number

    @ValidateNested()
    @Type(() => MongoDbConfig)
    masterDb: MongoDbConfig

    @ValidateNested()
    @Type(() => RedisConfig)
    redis: RedisConfig

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
    shareSecret: string

    @IsString()
    @IsNotEmpty()
    domain: string

    @IsNumber()
    @IsNotEmpty()
    payloadTTL: number

    @IsNumber()
    @IsNotEmpty()
    proofTTL: number

    @IsNumber()
    @IsNotEmpty()
    energyTTL: number

    @IsNumber()
    @IsNotEmpty()
    bootsTTL: number

    @IsNumber()
    @IsNotEmpty()
    adsBombTTL: number

    @IsNumber()
    @IsNotEmpty()
    numberBomb: number

    @IsNumber()
    @IsNotEmpty()
    numberLightning: number

    @IsNumber()
    @IsNotEmpty()
    numberMoneyShare: number

    @IsNumber()
    @IsNotEmpty()
    numberMoneyEarn: number

    @IsString()
    @IsNotEmpty()
    providerPaymentId: string

    @IsString()
    @IsNotEmpty()
    rpcUrl: string

    constructor() {
        const env = process.env
        this.nodeEnv = env.NODE_ENV
        this.appEnv = env.APP_ENV
        this.runEnv = env.RUN_ENV
        this.port = parseInt(env.PORT)
        this.socketPort = parseInt(env.SOCKET_PORT)
        this.masterDb = this.decodeStringObj(env.MASTER_DB)
        this.redis = this.decodeStringObj(env.REDIS)
        this.bot = this.decodeStringObj(env.BOT)
        this.jwt = this.decodeStringObj(env.JWT)
        this.telegramTokenBot = env.TELEGRAM_BOT_TOKEN
        this.basicAuthPassword = env.BASIC_AUTH_PASSWORD
        this.awsConfig = this.decodeStringObj(env.AWS_CREDENTIALS)
        this.secretKey = env.SECRET_KEY
        this.ivKey = env.IV_KEY
        this.expireNonce = parseInt(env.EXPIRES_NONCE)
        this.shareSecret = env.SHARED_SECRET
        this.domain = env.DOMAIN
        this.payloadTTL = parseInt(env.PAYLOAD_TTL)
        this.proofTTL = parseInt(env.PROOF_TTL)
        this.energyTTL = parseInt(env.ENERGY_TTL)
        this.bootsTTL = parseInt(env.BOOTS_TTL)
        this.numberBomb = parseInt(env.NUMBER_BOMB)
        this.numberLightning = parseInt(env.NUMBER_LIGHTNING)
        this.numberMoneyShare = parseInt(env.NUMBER_MONEY_SHARE)
        this.numberMoneyEarn = parseInt(env.NUMBER_MONEY_EARN)
        this.adsBombTTL = parseInt(env.ADS_BOMB_TTL)
        this.providerPaymentId = env.PROVIDER_PAYMENT_ID
        this.rpcUrl = env.RPC_URL
    }

    isProductionNodeEnv() {
        return this.nodeEnv === 'production'
    }

    isProductionAppEnv() {
        return this.appEnv === 'production'
    }

    private decodeStringObj(str: string) {
        return JSON.parse(str.replace(/\\/g, ''))
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
