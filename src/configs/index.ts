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
    @Type(() => JwtConfig)
    jwt: JwtConfig

    @IsString()
    @IsNotEmpty()
    telegramTokenBot: string

    @IsString()
    basicAuthPassword: string

    @IsString()
    @IsNotEmpty()
    secretKey: string

    @IsString()
    @IsNotEmpty()
    ivKey: string

    @IsString()
    @IsNotEmpty()
    ckbAddress: string

    @IsString()
    @IsNotEmpty()
    ckbURL: string

    @IsString()
    @IsNotEmpty()
    apiUrl: string

    @IsString()
    @IsNotEmpty()
    apiKey: string

    constructor() {
        const env = process.env
        this.nodeEnv = env.NODE_ENV
        this.appEnv = env.APP_ENV
        this.runEnv = env.RUN_ENV
        this.port = parseInt(env.PORT)
        this.masterDb = this.decodeStringObj(env.MASTER_DB)
        this.redisUri = this.decodeObjToStringRedis(env.REDIS)
        this.jwt = this.decodeStringObj(env.JWT)
        this.telegramTokenBot = env.TELEGRAM_BOT_TOKEN
        this.basicAuthPassword = env.BASIC_AUTH_PASSWORD
        this.secretKey = env.SECRET_KEY
        this.ivKey = env.IV_KEY
        this.ckbAddress = env.CKB_ADDRESS
        this.ckbURL = env.CKB_URL
        this.apiUrl = env.API_URL
        this.apiKey = env.API_KEY
    }

    isProductionNodeEnv() {
        return this.nodeEnv === 'production'
    }

    isProductionRunEnv() {
        return this.runEnv !== 'develop'
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
