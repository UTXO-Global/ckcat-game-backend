import { Expose } from 'class-transformer'
import { BaseDTO, BaseReqDTO } from '../../../base/base.dto'

export class AdminDTO extends BaseReqDTO {
    @Expose()
    id: string

    @Expose()
    email: string

    @Expose()
    password: string

    @Expose()
    salt: string

    hideSensitiveData() {
        delete this.salt
        delete this.password
    }
}
