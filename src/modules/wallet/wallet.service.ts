import { Inject, Service } from 'typedi'
import { Config } from '../../configs'
import { WalletController } from './wallet.controller'
import { Errors } from '../../utils/error'
import { WalletConnectionDTO } from './dtos/wallet-connect-req.dto'
import { GenerateCustomTokenDTO } from './dtos/generate-custom-token-req.dto'
import { App } from '../../app'

@Service()
export class WalletService {
    constructor(@Inject() private config: Config) {}

    connection(data: WalletConnectionDTO) {
        const walletSockets = WalletController.walletSockets
        if (data.userId) {
            const walletSocket = walletSockets.find(
                (walletWS) => walletWS.userId === data.userId
            )
            if (walletSocket) {
                walletSocket.ws.send(JSON.stringify({ action: 'connection' }))
                return true
            }
            throw Errors.InvalidAccount
        }
        throw Errors.InvalidAccount
    }

    connected(data: WalletConnectionDTO, wss: WebSocket) {
        const userSockets = WalletController.userSockets
        wss.send(data.userId)
        if (data.userId) {
            const userSocket = userSockets.find(
                (userWS) => userWS.userId === data.userId
            )
            if (userSocket) {
                userSocket.ws.send(
                    JSON.stringify({
                        action: 'connected',
                        address: data.address,
                    })
                )
                return true
            }
            throw Errors.InvalidAccount
        }
        throw Errors.InvalidAccount
    }

    connectedFromSocket(userId: string, address: string, wss: WebSocket) {
        const userSockets = WalletController.userSockets
        if (userId) {
            const userSocket = userSockets.find(
                (userWS) => userWS.userId == userId
            )
            if (userSocket) {
                userSocket.ws.send(
                    JSON.stringify({
                        action: 'connected',
                        address: address,
                    })
                )
                return true
            }
            wss.send(
                JSON.stringify({
                    action: 'connected',
                    address: userSockets[0].userId,
                    userId: userId,
                })
            )
            throw Errors.InvalidAccount
        }
        wss.send(
            JSON.stringify({
                action: 'connected',
                address: userSockets[0],
                userId: userId,
            })
        )
    }

    async generateCustomTokenFirebase(data: GenerateCustomTokenDTO) {
        const admin = App.admin
        try {
            const customToken = await admin
                .auth()
                .createCustomToken(`${data.userId}`)
            return { token: customToken }
        } catch (error) {
            throw error
        }
    }
}
