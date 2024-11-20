// import { Config, validateEnv } from './configs'
// import { AppDataSource } from './database/connection'
// import { WebSocketServer } from 'ws'
// import { AuthService } from './modules/auth/auth.service'
// import Container from 'typedi'
// import { extractUserId, extractWalletId } from './utils'
// import { WalletController } from './modules/wallet/wallet.controller'
// import { UserSocket } from './modules/wallet/models/user-socket.model'
// import { logger } from './utils/logger'
// import { WalletService } from './modules/wallet/wallet.service'
// import { WalletConnectionDTO } from './modules/wallet/dtos/wallet-connect-req.dto'

// export class Socket {
//     constructor(private config: Config) {
//         if (config.runEnv != 'production') {
//             this.start()
//         }
//     }

//     async start() {
//         const start = Date.now()

//         validateEnv(this.config)
//         await Promise.all([AppDataSource.initialize()])

//         const port = this.config.socketPort
//         const wss = new WebSocketServer({ port })
//         const walletController = Container.get(WalletController)
//         const walletService = Container.get(WalletService)

//         wss.on('connection', async (ws, req) => {
//             var userId: string
//             var walletId: string

//             try {
//                 userId = extractUserId(req.url)
//                 walletId = extractWalletId(req.url)
//                 if (userId) {
//                     walletController.addUserSocket(new UserSocket(ws, userId))
//                 } else if (walletId) {
//                     walletController.addWalletSocket(
//                         new UserSocket(ws, walletId)
//                     )
//                 }
//             } catch (error) {
//                 ws.send(JSON.stringify(error))
//                 ws.close()
//                 return
//             }

//             ws.on('message', async (data) => {
//                 const message = JSON.parse(data)
//                 const action = message.action
//                 if (action == 'connected') {
//                     walletService.connectedFromSocket(
//                         message.userId,
//                         message.address,
//                         ws
//                     )
//                 }
//             })

//             // Handle client disconnect
//             ws.on('close', () => {
//                 if (userId) {
//                     walletController.removeUserSocketWithId(userId)
//                 } else if (walletId) {
//                     walletController.removeWalletSocketWithId(walletId)
//                 }
//             })

//             // Optionally handle errors
//             ws.on('error', (error) => {
//                 console.error('WebSocket error:', error)
//             })

//             ws.send(
//                 JSON.stringify({
//                     action: 'connect socket',
//                 })
//             )
//         })

//         console.log(`Listening at ${port}...`)
//     }
// }
