import { IsNumber, IsString } from 'class-validator'

export class MongoDbConfig {
    @IsString()
    connectionString: string
}
