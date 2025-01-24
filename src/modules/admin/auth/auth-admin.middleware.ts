import { NextFunction, Request, Response } from 'express'
import { Inject, Service } from 'typedi'
import { Errors } from '../../../utils/error'
import { AuthAdminService } from './auth-admin.service'

export interface AuthCMSRequest extends Request {
    email: string
    accessToken: string
}

@Service()
export class AuthAdminMiddleware {
    constructor(@Inject() private authAdminService: AuthAdminService) {}

    async authorize(req: AuthCMSRequest, res: Response, next: NextFunction) {
        try {
            const token = getAuthHeader(req)
            if (!token) throw Errors.Unauthorized
            const payload = await this.authAdminService.verifyToken(token)
            req.email = payload.email
            req.accessToken = token
            next()
        } catch (err) {
            next(err)
        }
    }

    async authorizeIfNeeded(
        req: AuthCMSRequest,
        res: Response,
        next: NextFunction
    ) {
        try {
            const token = getAuthHeader(req)
            if (!token) return next()
            const payload = await this.authAdminService.verifyToken(token)
            req.email = payload.email
            req.accessToken = token
            next()
        } catch (err) {
            next(err)
        }
    }
}

const getAuthHeader = (req: Request) => {
    const authHeader = req.headers['authorization']
    return authHeader?.split(' ')[1]
}
