import { Inject, Service } from 'typedi'
import { CacheKeys, CacheManager } from '../../caches'
import { startTransaction } from '../../database/connection'
import { User } from './entities/user.entity'
import { UserDTO } from './dtos/user.dto'
import { plainToInstance } from 'class-transformer'
import { CoinReqDTO } from './dtos/coin.dto'
import { Config } from '../../configs'
import { isWithinSeconds } from '../../utils'
import { NonceService } from '../nonce/nonce.service'
import crypto from 'crypto'
import { Address, Cell } from '@ton/core'
import { TonClient } from '@ton/ton'
import BN from 'bn.js'
import nacl from 'tweetnacl'
import { CheckProofPayload } from './dtos/proof.dto'
import jwt from 'jsonwebtoken'
import { AuthRequest } from '../auth/auth.middleware'

@Service()
export class UserService {
    constructor(
        @Inject() private nonceService: NonceService,
        @Inject() private config: Config,
        @Inject() private cacheManager: CacheManager
    ) {}

    

    async getUserInfo(data: UserDTO) {
        var user = await User.getUser(data.id)
        if (!user) {
            user = await startTransaction(async (manager) => {
                const user = await User.createUser(data, manager)
                return user
            })
        }
        const res = plainToInstance(UserDTO, user, {
            excludeExtraneousValues: true,
        })
        return {
            ...res,
        }
    }
}
