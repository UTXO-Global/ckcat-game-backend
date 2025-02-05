import { addressToScript } from '@nervosnetwork/ckb-sdk-utils'
export const parseCKBAddress = (address: string) => {
    try {
        return addressToScript(address)
    } catch (error) {
        console.error('Invalid CKB address from config:', error.message)
    }
}
