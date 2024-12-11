import 'reflect-metadata'
import { App } from './app'
import { config } from './configs'
import { HealthRoute } from './modules/health/health.route'
import { UserRoute } from './modules/user/user.route'
import { GameRoute } from './modules/game/game.route'
import { TransactionRoute } from './modules/transaction/transaction.route'
import { GemsRoute } from './modules/gems/gems.route'
import { PackageRoute } from './modules/package/package.route'
import { OrderRoute } from './modules/order/order.route'
import { CheckInRoute } from './modules/check-in/check-in.route'
import { EventSettingRoute } from './modules/event-setting/event-setting.route'
import { WalletRoute } from './modules/wallet/wallet.route'

const app = new App(config, [
    {
        routes: [HealthRoute],
    },
    {
        version: 'v1',
        routes: [
            UserRoute,
            GameRoute,
            TransactionRoute,
            GemsRoute,
            PackageRoute,
            OrderRoute,
            CheckInRoute,
            EventSettingRoute,
            WalletRoute,
        ],
    },
])
app.start()
