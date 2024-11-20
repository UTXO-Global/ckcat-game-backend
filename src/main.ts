import 'reflect-metadata'
import { App } from './app'
import { config } from './configs'
import { HealthRoute } from './modules/health/health.route'
import { UserRoute } from './modules/user/user.route'
import { InvoiceRoute } from './modules/invoice/invoice.route'
import { TransactionRoute } from './modules/transaction/transaction.route'
import { WalletRoute } from './modules/wallet/wallet.route'

const app = new App(config, [
    {
        routes: [HealthRoute],
    },
    {
        version: 'v1',
        routes: [
            UserRoute,
            InvoiceRoute,
            TransactionRoute,
            WalletRoute,
        ],
    },
])
app.start()

// new Socket(config)
