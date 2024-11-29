import { CKAuthRequest } from '../modules/auth/auth.middleware'
import { BaseReqDTO } from './base.dto'

export interface DataRequest<T extends BaseReqDTO> extends CKAuthRequest {
    data: T
}
