import { Service } from 'typedi'
import { NonceDTO } from './dto/nonce.dto'

@Service()
export class NonceService {
    async isNonceAlready(nonce: string) {
        return await NonceDTO.isNonceAlready(nonce)
    }

    async saveNonce(nonce: string) {
        const nonceDTO = new NonceDTO()
        nonceDTO.nonce = nonce
        await nonceDTO.save()
    }
}
