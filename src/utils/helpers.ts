import { parseAddress } from '@ckb-lumos/helpers'

export const parseCKBAddress = (address: string) => {
    try {
        return parseAddress(address)
    } catch (error) {
        console.error('Invalid CKB address from config:', error.message)
    }
}
