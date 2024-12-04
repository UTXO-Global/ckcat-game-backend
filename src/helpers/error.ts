import { Expose, plainToInstance } from 'class-transformer'
import { Response } from 'express'
import { ResponseWrapper } from './response.wrapper'

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
    LimitInvalid: new ErrorResp(
        'error.LimitInvalid',
        'Limit invalid (maximum is 100)',
        400
    ),
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
    AlreadyHaveColossalAccount: new ErrorResp(
        'error.alreadyHaveColossalAccount',
        'Already have colossal account.'
    ),
    ColossalAccountWrongUserNameOrPassword: new ErrorResp(
        'error.colossalAccountWrongUserNameOrPassword',
        'colossal account wrong username or password.'
    ),
    ColossalAccountIsLinked: new ErrorResp(
        'error.colossalAccountIsLinked',
        'colossal account is linked.'
    ),
    AccountWolfdenIsLinked: new ErrorResp(
        'error.accountWolfdenIsLinked',
        'Account wolfden is linked.'
    ),
    AlreadyHaveWolfdenAccount: new ErrorResp(
        'error.alreadyHaveWolfdenAccount',
        'Already have wolfden account.'
    ),
    ExistedEmail: new ErrorResp('error.existedEmail', 'Email existed.'),
    ExistedPhoneNumber: new ErrorResp(
        'error.existedPhoneNumber',
        'Phone number existed.'
    ),
    UserNotFound: new ErrorResp('error.userNotFound', 'User not found.'),
    InvalidAccount: new ErrorResp(
        'error.invalidAccount',
        'Invalid username or password.'
    ),
    UpdateProfileFailed: new ErrorResp(
        'error.updateProfileFailed',
        'Failed to update user profile.'
    ),
    InvalidImageType: new ErrorResp(
        'error.invalidImageType',
        'Invalid image type.'
    ),
    InvalidVideoType: new ErrorResp(
        'error.invalidVideoType',
        'Invalid video type.'
    ),
    InvalidMediaType: new ErrorResp(
        'error.invalidMediaType',
        'Invalid media type.'
    ),
    SportNotFound: new ErrorResp('error.sportNotFound', 'Sport not found.'),
    SportFavoriteExisted: new ErrorResp(
        'error.sportFavoriteExisted',
        'Sport favorite existed.'
    ),
    InvalidCurrentPassword: new ErrorResp(
        'error.invalidCurrentPassword',
        'Invalid current password.'
    ),
    InvalidAccountRequestResetPassword: new ErrorResp(
        'error.invalidAccountRequestResetPassword',
        'Invalid account request reset password.'
    ),
    TokenUsed: new ErrorResp('error.tokenUsed', 'Token used.'),
    TokenExpired: new ErrorResp('error.tokenExpired', 'Token expired.'),
    SendMailFailed: new ErrorResp('err.sendMailFailed', 'Failed to send mail.'),
    ChangePasswordFailed: new ErrorResp(
        'error.changePasswordFailed',
        'Failed to change password.'
    ),
    UserNotFollowing: new ErrorResp(
        'error.userNotFollowing',
        'User is not following you.'
    ),
    UserAlreadyFollowed: new ErrorResp(
        'error.alreadyFollowed',
        'User already followed.'
    ),
    InvalidRole: new ErrorResp('error.invalidRole', 'Invalid role.'),
    AccountBlocked: new ErrorResp(
        'error.accountBlocked',
        'Account is blocked.'
    )
}

export const handleError = (err: Error, res: Response) => {
    if (err instanceof ErrorResp) {
        const errResp = err as ErrorResp
        res.status(errResp.status || Errors.BadRequest.status).send(
            new ResponseWrapper(
                null,
                plainToInstance(ErrorResp, errResp, {
                    excludeExtraneousValues: true,
                })
            )
        )
    } else {
        res.status(Errors.Sensitive.status).send(
            new ResponseWrapper(null, Errors.Sensitive)
        )
        return
    }
}

export const handleErrorUserBetting = (error: Error) => {
    if (error instanceof ErrorResp) return error as ErrorResp
    return new ErrorResp(
        Errors.InternalServerError.code,
        JSON.stringify(error),
        Errors.InternalServerError.status
    )
}
