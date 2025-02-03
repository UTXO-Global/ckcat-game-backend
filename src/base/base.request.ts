import { CKAuthRequest } from '../modules/auth/auth.middleware'
import { ErrorResp, Errors } from '../utils/error'
import { BaseReqDTO } from './base.dto'

export interface DataRequest<T extends BaseReqDTO> extends CKAuthRequest {
    data: T
}

export interface FieldQuery {
    field: string
    value: string
    values: string[]
}

export const parseFieldQueries = (
    data: string,
    supports = new Set<string>()
): FieldQuery[] => {
    if (!data) return []
    const queries = data.split(',')
    const fieldQueries: FieldQuery[] = []
    queries.forEach((query) => {
        const [field, value] = query.split(':')
        if (value === undefined) {
            return
        }
        if (supports.size > 0 && !supports.has(field)) {
            throw new ErrorResp(
                Errors.BadRequest.code,
                `${field} is not support`
            )
        }
        fieldQueries.push({
            field,
            value,
            values: value.split('|'),
        })
    })
    return fieldQueries
}
