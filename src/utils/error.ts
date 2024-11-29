import { Expose, plainToInstance } from 'class-transformer'
import { Response } from 'express'
import { config } from '../configs'
import { ResponseWrapper } from './response'

export class ErrorResp extends Error {
    @Expose()
    readonly status: number

    @Expose()
    readonly code: string

    @Expose()
    readonly message: string

    constructor(code: string, message: string, status?: number) {
        super()
        this.status = status
        this.code = code
        this.message = message
        this.stack = undefined
    }
}

export const Errors = {
    BadRequest: new ErrorResp('error.badRequest', 'Bad request', 400),
    Unauthorized: new ErrorResp('error.unauthorized', 'Unauthorized', 401),
    Forbidden: new ErrorResp('error.forbiden', 'Forbidden', 403),
    Sensitive: new ErrorResp(
        'error.sensitive',
        'An error occurred, please try again later.',
        400
    ),
    InternalServerError: new ErrorResp(
        'error.internalServerError',
        'Internal server error.',
        500
    ),
    InvalidFileType: new ErrorResp(
        'error.invalidFileType',
        'Invalid file type.'
    ),
    InvalidAccount: new ErrorResp('error.invalidAccount', 'Invalid account'),
    InvalidDeviceId: new ErrorResp(
        'error.invalidDeviceId',
        'Invalid device id'
    ),
    UserNotFound: new ErrorResp('error.userNotFound', 'User not found'),
    EmailNotFound: new ErrorResp('error.emailNotFound', 'Email not found'),
    EmailExisted: new ErrorResp('error.emailExisted', 'Email existed'),
    UserIdExisted: new ErrorResp('error.userIdExisted', 'User id existed'),
    InvalidBuy: new ErrorResp('error.buy', 'Invalid buys'),
    NotEnoughMoney: new ErrorResp('error.notEnoughMoney', 'Not enough money'),
    Cheating: new ErrorResp('error.cheating', 'User try to cheating'),
    NotEnoughEnergy: new ErrorResp(
        'error.notEnoughEnergy',
        'Not enough energy'
    ),
    NotEnoughSkill: new ErrorResp('error.notEnoughSkill', 'Not enough skill'),
    HaveAlreadyRC: new ErrorResp(
        'error.haveAlreadyRC',
        'Have Already Referral Code'
    ),
    ReferralCodeNotFound: new ErrorResp(
        'error.referralCodeNotFound',
        'Referral Code Not Found'
    ),
    WrongReferralCode: new ErrorResp(
        'error.wrongReferralCode',
        'Wrong Referral Code'
    ),
    NotEnoughCoin: new ErrorResp('error.notEnoughCoin', 'Not enough coin'),
    WaitingPrediction: new ErrorResp(
        'error.waitingPrediction',
        'Waiting prediction'
    ),
    TransactionHashExisted: new ErrorResp(
        'error.transactionHashExisted',
        'Transaction Hash Existed'
    ),
    TransactionHashNotExisted: new ErrorResp(
        'error.TransactionHashNotExisted',
        'Transaction Hash Not Existed'
    ),
    QuestNotFound: new ErrorResp('error.questNotFound', 'Quest Not Found'),
}

export const handleError = (err: Error, res: Response) => {
    if (err instanceof ErrorResp) {
        const errResp = err as ErrorResp
        res.status(errResp.status || Errors.BadRequest.status).send(
            new ResponseWrapper(
                null,
                null,
                plainToInstance(ErrorResp, errResp, {
                    excludeExtraneousValues: true,
                })
            )
        )
    } else {
        console.log(err)
        if (config.isProductionAppEnv()) {
            res.status(Errors.Sensitive.status).send(
                new ResponseWrapper(null, null, Errors.Sensitive)
            )
            return
        }
        const errResp = new ErrorResp(
            Errors.InternalServerError.code,
            JSON.stringify(err),
            Errors.InternalServerError.status
        )
        res.status(Errors.Sensitive.status).send(
            new ResponseWrapper(null, null, errResp)
        )
    }
}
