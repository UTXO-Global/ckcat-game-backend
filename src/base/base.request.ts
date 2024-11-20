import { AuthRequest } from '../modules/auth/auth.middleware'
import { BaseReqDTO } from './base.dto'

export interface DataRequest<T extends BaseReqDTO> extends AuthRequest {
    data: T
}
