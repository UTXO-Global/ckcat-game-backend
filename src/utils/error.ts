import { Expose, plainToInstance } from 'class-transformer'
import { Response } from 'express'
import { logger } from './logger'
import { ResponseWrapper } from './response'
import { error } from 'winston'

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
    UserNotFound: new ErrorResp('error.userNotFound', 'User not found'),
    MeetingsEmpty: new ErrorResp('error.meetingsEmpty', 'Meetings empty'),
    RacesEmpty: new ErrorResp('error.racesEmpty', 'Races empty'),
    AccountIsNotActive: new ErrorResp(
        'error.accountIsNotActive',
        'Account is not active.'
    ),
    RaceIsEmpty: new ErrorResp('error.raceIsEmpty', 'Race is empty.'),
    RunnerIsEmpty: new ErrorResp('error.runnerIsEmpty', 'Runner is empty.'),
    InvalidRole: new ErrorResp('error.invalidRole', 'Invalid role.'),
    MeetingNotFound: new ErrorResp(
        'error.meetingNotFound',
        'Meeting not found'
    ),
    GetResultByMeetingsFailed: new ErrorResp(
        'error.getResultByMeetingsFailed',
        'Get result by meetings failed.'
    ),
    MeetingIsNotEmpty: new ErrorResp(
        'error.meetingIsNotEmpty',
        'Meeting is not empty.'
    ),
    FromDateIsNotEmpty: new ErrorResp(
        'error.fromDateIsNotEmpty',
        'From date is not empty.'
    ),
    MaxRecursive: new ErrorResp('error.maxRecursive', 'Max recursive.'),
    DeductionNotFound: new ErrorResp(
        'error.deductionNotFound',
        'Deduction Not Found.'
    ),
    UserIdExisted: new ErrorResp('error.userIdExisted', 'User id existed'),
    InvalidAccount: new ErrorResp('error.invalidAccount', 'Invalid account'),
    CheckInAlready: new ErrorResp('error.checkInAlready', 'Check in already'),
    CompletedDailyLogin: new ErrorResp(
        'error.completedDailyLogin',
        'You have already completed your 30-day login streak.'
    ),
    CheckInRewardNotFound: new ErrorResp(
        'error.checkInRewardNotFound',
        'Check in reward not found'
    ),
    NotEnoughGems: new ErrorResp('error.notEnoughGems', 'Not Enough Gems'),
    EventSettingNotFound: new ErrorResp(
        'error.eventSettingNotFound',
        'Event Setting Not Found'
    ),
    GemsNotAvailable: new ErrorResp(
        'error.GemsNotAvailable',
        'Gems Is Not Available'
    ),
    InternalServiceError: new ErrorResp(
        'error.internalServiceError',
        'Internal Service Error'
    ),
    GameNotFound: new ErrorResp('error.gameNotFound', 'Game Not Found'),
    AdminNotFound: new ErrorResp('error.adminNotFound', 'Admin Not Found'),
    EndMustGreaterThanStart: new ErrorResp(
        'error.endMustGreaterThanStart',
        'End must greater than start'
    ),
    GameAirdropNotFound: new ErrorResp(
        'error.gameAirdropNotFound',
        'Game Airdrop Not Found'
    ),
    AirdropClosed: new ErrorResp('error.airdropClosed', 'Airdrop Closed'),
    WalletAddressNotFound: new ErrorResp(
        'error.walletAddressNotFound',
        'Wallet Address Not Found'
    ),
    WalletTypeNotSupport: new ErrorResp(
        'error.walletTypeNotSupport',
        'Wallet Type Not Support'
    ),
    MaxParticipationReached: new ErrorResp(
        'error.maxParticipationReached',
        'Max Participation Reached'
    ),
    BotSettingNotFound: new ErrorResp(
        'erorr.botSettingNotFound',
        'Bot Setting Not Found'
    ),
    UserNotMatch: new ErrorResp('error.userNotMatch', 'User Not Match'),
    InvalidGameData: new ErrorResp(
        'error.invalidGameData',
        'Invalid Game Data'
    ),
    UserAlreadyConvert: new ErrorResp(
        'error.userAlreadyConvert',
        'User Already Convert'
    ),
    ConvertAddressNotMatch: new ErrorResp(
        'error.convertAddressNotMatch',
        'Convert Address Not Match'
    ),
    InvalidApiKey: new ErrorResp('error.invalidApiKey', 'Invalid Api Key'),
    GameSeasonNotFound: new ErrorResp(
        'error.gameSeasonNotFound',
        'Game Season Not Found'
    ),
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
        logger.error(JSON.stringify(err))
    }
}
