import { ClassConstructor } from 'class-transformer'
import cors from 'cors'
import express, {
    json,
    NextFunction,
    Request,
    Response,
    Router,
    urlencoded,
} from 'express'
import expressBasicAuth from 'express-basic-auth'
import helmet from 'helmet'
import morgan from 'morgan'
import 'reflect-metadata'
import Container from 'typedi'
import { Config, validateEnv } from './configs'
import { AppDataSource } from './database/connection'
import { QueueManager, setupQueues } from './queues/queues'
import { setupCrons, setupWorkers } from './queues/workers'
import { handleError } from './utils/error'
import { logger } from './utils/logger'
import { Context, Markup, Telegraf } from 'telegraf'
import { Update } from 'telegraf/typings/core/types/typegram'
import { isSuccessfulPaymentMessage } from './utils'
import { UserController } from './modules/user/user.controller'
import { InvoiceController } from './modules/invoice/invoice.controller'
import { TransactionController } from './modules/transaction/transaction.controller'
import { BigMoneyPurchaseType, GameType } from './base/base.dto'

export interface BaseRoute {
    route?: string
    router: Router
}

export interface AppRoute {
    version?: string
    groups?: {
        group?: string
        routes: ClassConstructor<BaseRoute>[]
    }[]
    routes?: ClassConstructor<BaseRoute>[]
}

export class App {
    private app = express()
    static admin = require('firebase-admin')

    constructor(private config: Config, routes: AppRoute[]) {
        setupQueues()
        this.initMiddlewares()
        this.initRoutes(routes)
    }

    private initMiddlewares() {
        // cross-origin resource sharing
        this.app.use(cors())

        // http headers to improve security
        this.app.use(helmet())

        // body parser
        this.app.use(json())
        this.app.use(urlencoded({ extended: true }))

        // http request logger
        this.app.use(
            morgan('short', {
                skip: (req) => {
                    return (
                        req.url.startsWith('/api/queues') ||
                        req.url.startsWith('/admin/queues') ||
                        req.url.startsWith('/healthcheck')
                    )
                },
            })
        )
    }

    private initRoutes(routes: AppRoute[]) {
        routes.forEach((route) => {
            let path = '/'
            if (route.version) {
                path += route.version + '/'
            }
            // init group routes
            route.groups?.forEach((group) => {
                group.routes.forEach((clsRoute) => {
                    const route = Container.get(clsRoute)
                    const routePath =
                        path + group.group + '/' + (route.route ?? '')
                    this.app.use(routePath, route.router)
                })
            })
            // init routes
            route.routes?.forEach((clsRoute) => {
                const route = Container.get(clsRoute)
                const routePath = path + (route.route ?? '')
                this.app.use(routePath, route.router)
            })
        })

        // queue dashboard
        this.app.use(
            '/admin/queues',
            expressBasicAuth({
                challenge: true,
                users: { admin: this.config.basicAuthPassword },
            }),
            Container.get(QueueManager).createBoard().getRouter()
        )

        // error handler
        this.app.use(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            (err: Error, req: Request, res: Response, next: NextFunction) => {
                handleError(err, res)
            }
        )
    }

    async start() {
        const start = Date.now()

        validateEnv(this.config)
        await Promise.all([AppDataSource.initialize()])
        setupWorkers()
        await setupCrons()

        this.app.listen(this.config.port, () => {
            return logger.info(
                `Server is listening at port ${
                    this.config.port
                } - Elapsed time: ${(Date.now() - start) / 1000}s`
            )
        })

        process.on('uncaughtException', (err) => {
            logger.error(err)
        })

        process.on('unhandledRejection', (reason, promise) => {
            logger.error(
                `Unhandled Rejection at: Promise ${JSON.stringify({
                    promise,
                    reason,
                })}`
            )
        })

        // try {
        //     const serviceAccount = require('../firebase/serviceAccountKey.json')
        //     const admin = App.admin
        //     admin.initializeApp({
        //         credential: admin.credential.cert(serviceAccount),
        //         databaseURL:
        //             'https://demowallet-e5bde-default-rtdb.asia-southeast1.firebasedatabase.app/',
        //     })
        //     console.log('Firebase Admin SDK initialized successfully')
        // } catch (error) {
        //     console.error('Error initializing Firebase Admin SDK:', error)
        // }

        this.botConfig()
        // if (this.config.isProductionNodeEnv()) {

        //     this.botTonPlayConfig()
        //     this.botWalletConfig()
        // }
    }

    async botConfig() {
        const bot = new Telegraf(this.config.telegramTokenBot)

        bot.start(async (ctx) => {
            const keyboard = Markup.inlineKeyboard([
                Markup.button.url('PLAY GAME CENTER', this.config.bot.url),
            ])

            const imageUrl =
                'https://purple-advisory-wombat-172.mypinata.cloud/ipfs/QmYTBhXCqdtRGwExS2dUUi88vACiBxpCqF3oN1q1xsAMT3?pinataGatewayToken=YGrSaWv7gcuq1OtGbYvONGKkoZ2K4X4JxSnjDZeOE-HAIFWMayFyhMjP8FSr4JaY'
            await ctx.replyWithPhoto(
                { url: imageUrl },
                {
                    caption: this.config.bot.title,
                    reply_markup: keyboard.reply_markup,
                }
            )
        })

        bot.on('pre_checkout_query', async (ctx, test) => {
            console.log('payment', ctx.update.pre_checkout_query)
            await ctx.answerPreCheckoutQuery(true)
        })

        bot.on('message', async (ctx: Context<Update>) => {
            const message = ctx.message
            if (message['text'] == 'UTXO_METACAT') {
                const keyboard = Markup.inlineKeyboard([
                    Markup.button.url('PLAY GAME', this.config.bot.url),
                ])
                const imageUrl =
                    'https://purple-advisory-wombat-172.mypinata.cloud/ipfs/QmYTBhXCqdtRGwExS2dUUi88vACiBxpCqF3oN1q1xsAMT3?pinataGatewayToken=YGrSaWv7gcuq1OtGbYvONGKkoZ2K4X4JxSnjDZeOE-HAIFWMayFyhMjP8FSr4JaY'
                await ctx.replyWithPhoto(
                    { url: '' },
                    {
                        caption: this.config.bot.title,
                        reply_markup: keyboard.reply_markup,
                    }
                )
                return
            }
            if (message && isSuccessfulPaymentMessage(message)) {
                try {
                    const payload = JSON.parse(
                        message.successful_payment.invoice_payload
                    )
                    const telegramPaymentChargeId =
                        message.successful_payment.telegram_payment_charge_id
                    const providerPaymentChargeId =
                        message.successful_payment.provider_payment_charge_id
                    if (payload) {
                        const { orderId, value, gameType, purchaseType } =
                            payload
                        const userController = Container.get(UserController)
                        const invoiceController =
                            Container.get(InvoiceController)
                        const transactionController = Container.get(
                            TransactionController
                        )
                        const invoiceDTO =
                            await invoiceController.getOrderInvoice(orderId)
                        if (invoiceDTO) {
                            await transactionController.createTransaction(
                                invoiceDTO,
                                telegramPaymentChargeId,
                                providerPaymentChargeId
                            )
                            await invoiceController.paidInvoice(orderId)
                        }
                    }
                } catch (error) {
                    logger.info('error successful_payment: ', error)
                }
            } else {
                // await ctx.reply('This is not a successful payment message.')
            }
        })

        bot.launch().then(() => {
            console.log('Bot is running')
        })

        process.once('SIGINT', () => bot.stop('SIGINT'))
        process.once('SIGTERM', () => bot.stop('SIGTERM'))
    }

    async botTonPlayConfig() {
        const bot = new Telegraf(
            '6999406512:AAF6G7pA0ylky_5N49OjM4jFM0awL10t2oY'
        )

        bot.start(async (ctx) => {
            const keyboard = Markup.inlineKeyboard([
                Markup.button.url(
                    'PLAY GAME CENTER',
                    'https://t.me/tonplaygg_bot/game_center'
                ),
            ])

            const imageUrl =
                'https://purple-advisory-wombat-172.mypinata.cloud/ipfs/QmYTBhXCqdtRGwExS2dUUi88vACiBxpCqF3oN1q1xsAMT3?pinataGatewayToken=YGrSaWv7gcuq1OtGbYvONGKkoZ2K4X4JxSnjDZeOE-HAIFWMayFyhMjP8FSr4JaY'
            await ctx.replyWithPhoto(
                { url: imageUrl },
                {
                    caption:
                        'Welcome TonPlay.GG!\nClick the button below to play game Game Center:',
                    reply_markup: keyboard.reply_markup,
                }
            )
        })

        bot.on('pre_checkout_query', async (ctx, test) => {
            console.log('payment', ctx.update.pre_checkout_query)
            await ctx.answerPreCheckoutQuery(true)
        })

        bot.on('message', async (ctx: Context<Update>) => {
            const message = ctx.message
            if (message && isSuccessfulPaymentMessage(message)) {
                try {
                    const payload = JSON.parse(
                        message.successful_payment.invoice_payload
                    )
                    const telegramPaymentChargeId =
                        message.successful_payment.telegram_payment_charge_id
                    const providerPaymentChargeId =
                        message.successful_payment.provider_payment_charge_id
                    if (payload) {
                        const { orderId, value, gameType, purchaseType } =
                            payload
                        const userController = Container.get(UserController)
                        const invoiceController =
                            Container.get(InvoiceController)
                        const transactionController = Container.get(
                            TransactionController
                        )
                        const invoiceDTO =
                            await invoiceController.getOrderInvoice(orderId)
                        if (invoiceDTO) {
                            await transactionController.createTransaction(
                                invoiceDTO,
                                telegramPaymentChargeId,
                                providerPaymentChargeId
                            )
                            await invoiceController.paidInvoice(orderId)
                        }
                    }
                } catch (error) {
                    logger.info('error successful_payment: ', error)
                }
            } else {
                // await ctx.reply('This is not a successful payment message.')
            }
        })

        bot.launch().then(() => {
            console.log('Bot is running')
        })

        process.once('SIGINT', () => bot.stop('SIGINT'))
        process.once('SIGTERM', () => bot.stop('SIGTERM'))
    }

    async botWalletConfig() {
        const bot = new Telegraf(
            '7263385697:AAFxuhPOJKjK-TH6a7ANPREOtDF_PnzvWUc'
        )

        bot.start(async (ctx) => {
            const keyboard = Markup.inlineKeyboard([
                Markup.button.url(
                    'OPEN WALLET',
                    'https://t.me/tonplaygg_bot/game_center'
                ),
            ])

            const imageUrl =
                'https://purple-advisory-wombat-172.mypinata.cloud/ipfs/QmRXiq4qhHAzqufjAVUFQzHGrTcpqNCMUADd46aeS2ofXA?pinataGatewayToken=YGrSaWv7gcuq1OtGbYvONGKkoZ2K4X4JxSnjDZeOE-HAIFWMayFyhMjP8FSr4JaY'
            await ctx.replyWithPhoto(
                { url: imageUrl },
                {
                    caption:
                        'Welcome Demo Wallet!\nClick the button below to open your wallet:',
                    reply_markup: keyboard.reply_markup,
                }
            )
        })

        bot.on('pre_checkout_query', async (ctx, test) => {
            console.log('payment', ctx.update.pre_checkout_query)
            await ctx.answerPreCheckoutQuery(true)
        })

        bot.on('message', async (ctx: Context<Update>) => {
            const message = ctx.message
        })

        bot.launch().then(() => {
            console.log('Bot is running')
        })

        process.once('SIGINT', () => bot.stop('SIGINT'))
        process.once('SIGTERM', () => bot.stop('SIGTERM'))
    }
}
