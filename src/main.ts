import 'reflect-metadata'
import { App } from './app'
import { config } from './configs'
import { HealthRoute } from './modules/health/health.route'
import { UserRoute } from './modules/user/user.route'
import { WalletRoute } from './modules/wallet/wallet.route'
import { GameRoute } from './modules/game/game.route'

const app = new App(config, [
    {
        routes: [HealthRoute],
    },
    {
        version: 'v1',
        routes: [
            UserRoute,
            WalletRoute,
            GameRoute,
        ],
    },
])
app.start()

// new Socket(config)
