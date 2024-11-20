export class WalletSocket {
    ws: WebSocket
    userId: string
    constructor(
        ws: WebSocket,
        userId: string,
    ) {
        this.ws = ws
        this.userId = userId
    }
}