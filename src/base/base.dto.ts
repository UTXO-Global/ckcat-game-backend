/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Expose } from 'class-transformer'
import { Request } from 'express'
import { AuthRequest } from '../modules/auth/auth.middleware'
import { Pagination } from '../utils/response'
import { AuthCMSRequest } from '../modules/admin/auth/auth-admin.middleware'

export class BaseDTO {
    @Expose()
    createdAt: Date

    @Expose()
    updatedAt: Date
}

export class BaseReqDTO {
    bind?(req: Request): void {}
}

export class BaseReqWithNonceDTO extends BaseReqDTO {
    @Expose()
    secretRequest: string

    @Expose()
    nonce: string

    @Expose()
    date: string
}

export class BaseReqPurchaseDTO extends BaseReqDTO {
    @Expose()
    title: string

    @Expose()
    label: string

    @Expose()
    description: string

    @Expose()
    currency: string

    @Expose()
    providerToken: string

    @Expose()
    photoUrl: string
}
export enum BigMoneyPurchaseType {
    maxEnergy = 0,
    refillEnergy,
    boots,
    bomb,
    lightning,
}
export enum GameType {
    BigMoney = 0,
}
export class BaseReqPurchaseValueDTO extends BaseReqPurchaseDTO {
    @Expose()
    numberCoin: number

    @Expose()
    gameType: GameType

    @Expose()
    purchaseType: number
}

export class BaseReqBuyShopDTO extends BaseReqDTO {
    @Expose()
    id: number
}

export class BaseReqSelectedDTO extends BaseReqDTO {
    @Expose()
    idSelected: number
}

export class DataReqDTO extends BaseReqDTO {
    pagination?: Pagination

    bind?(req: AuthRequest): void {
        this.pagination = Pagination.fromReq(req)
    }
}

export class DataCMSReqDTO extends BaseReqDTO {
    pagination?: Pagination

    bind?(req: AuthCMSRequest): void {
        this.pagination = Pagination.fromReq(req)
    }
}

export class AuthCMSReqDTO extends DataCMSReqDTO {
    email: string

    bind?(req: AuthCMSRequest) {
        super.bind(req)
        this.email = req.email
    }
}
