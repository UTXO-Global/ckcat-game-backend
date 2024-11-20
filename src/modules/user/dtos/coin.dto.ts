import { Expose } from 'class-transformer'
import { BaseReqWithNonceDTO } from '../../../base/base.dto'

export class CoinReqDTO extends BaseReqWithNonceDTO {
    @Expose()
    numberCoin: number
}
