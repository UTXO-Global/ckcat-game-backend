import { Inject, Service } from 'typedi'
import { Config } from '../../configs'
import { UserSocket } from './models/user-socket.model'
import { DataRequest } from '../../base/base.request'
import { WalletConnectionDTO } from './dtos/wallet-connect-req.dto'
import { NextFunction, Response } from 'express'
import { WalletSocket } from './models/wallet-socket.model'
import { ResponseWrapper } from '../../utils/response'
import { WalletService } from './wallet.service'
import { logger } from '../../utils/logger'
import { GenerateCustomTokenDTO } from './dtos/generate-custom-token-req.dto'

@Service()
export class WalletController {
    static userSockets: UserSocket[] = []
    static walletSockets: WalletSocket[] = []
    static clients = new Set<WebSocket>()
    constructor(
        @Inject() private config: Config,
        @Inject() private walletService: WalletService
    ) {}

    addUserSocket(userSocket: UserSocket) {
        console.log(`userSocket ${userSocket}...`)
        if (
            userSocket &&
            !WalletController.userSockets.some(
                (userWs) => userWs.userId == userSocket.userId
            )
        ) {
            console.log(`push ===> ${userSocket}...`)
            WalletController.userSockets.push(userSocket)
        }
    }

    removeUserSocketWithId(userId: String) {
        if (
            userId &&
            WalletController.userSockets.some(
                (userWs) => userWs.userId == userId
            )
        ) {
            WalletController.userSockets = WalletController.userSockets.filter(
                (userWs) => userWs.userId != userId
            )
        }
    }

    addWalletSocket(walletSocket: WalletSocket) {
        if (
            walletSocket &&
            !WalletController.walletSockets.some(
                (walletWs) => walletWs.userId === walletSocket.userId
            )
        ) {
            WalletController.walletSockets.push(walletSocket)
        }
    }

    removeWalletSocketWithId(userId: String) {
        if (
            userId &&
            !WalletController.walletSockets.some(
                (walletWs) => walletWs.userId === userId
            )
        ) {
            WalletController.walletSockets =
                WalletController.walletSockets.filter(
                    (walletWs) => walletWs.userId !== userId
                )
        }
    }

    checkConnection() {}

    connection(
        req: DataRequest<WalletConnectionDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { data } = req
            res.send(new ResponseWrapper(this.walletService.connection(data)))
        } catch (err) {
            next(err)
        }
    }

    connected(
        req: DataRequest<WalletConnectionDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { data } = req
            this.broadcast(
                JSON.stringify({
                    action: 'connected',
                    address: data.address,
                })
            )
            res.send(new ResponseWrapper(true))
        } catch (err) {
            next(err)
        }
    }

    broadcast(message) {
        console.log(`message ${message}...`)
        for (const client of WalletController.clients) {
            console.log(`client ${client}...`)
            client.send(message)
        }
    }

    async generateCustomTokenFirebase(
        req: DataRequest<GenerateCustomTokenDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { data } = req
            res.send(
                new ResponseWrapper(
                    await this.walletService.generateCustomTokenFirebase(data)
                )
            )
        } catch (err) {
            next(err)
        }
    }
}
