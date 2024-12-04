import 'reflect-metadata'
import { App } from './app'
import { config } from './configs'
import { HealthRoute } from './modules/health/health.route'
import { UserRoute } from './modules/user/user.route'
import { WalletRoute } from './modules/wallet/wallet.route'
import { GameRoute } from './modules/game/game.route'
import { TransactionRoute } from './modules/transaction/transaction.route'
import { GemsRoute } from './modules/gems/gems.route'
import { PackageRoute } from './modules/package/package.route'
import { OrderRoute } from './modules/order/order.route'

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
            TransactionRoute,
            GemsRoute,
            PackageRoute,
            OrderRoute,
        ],
    },
])
app.start()

