import { Inject, Service } from 'typedi'
import { Config } from '../../configs'
import { InvoiceService } from './invoice.service'
import { DataRequest } from '../../base/base.request'
import { PurchaseReqDTO } from '../user/dtos/purchase_req.dto'
import { NextFunction, Response } from 'express'
import { ResponseWrapper } from '../../utils/response'
import { UserDTO } from '../user/dtos/user.dto'
import { generateRandomString } from '../../utils'
import { Invoice } from './entities/invoice.entity'
import axios from 'axios'
import { plainToInstance } from 'class-transformer'
import { InvoiceDTO } from './dtos/invoice.dto'
import { AuthRequest } from '../auth/auth.middleware'

@Service()
export class InvoiceController {
    constructor(
        @Inject() private config: Config,
        @Inject() public invoiceService: InvoiceService
    ) {}

    async sendInvoice(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const invoice = {
                chat_id: '@games_appscyclone_bot',
                title: 'Mua 22 Coin',
                description: 'Thanh toán 250 star để mua 22 coin',
                payload: generateRandomString(4),
                provider_token: '',
                currency: 'XTR',
                prices: [{ label: 'Mua 22 Coin', amount: 25000 }],
            }

            const response = await axios.post(
                `https://api.telegram.org/bot${this.config.telegramTokenBot}/sendInvoice`,
                invoice,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            )
            res.send(new ResponseWrapper(response.data))
        } catch (err) {
            next(err)
        }
    }

    async createPurchaseStars(
        req: DataRequest<PurchaseReqDTO>,
        res: Response,
        next: NextFunction
    ) {
        const { user, data } = req
        data.currency = 'XTR'
        data.providerToken = ''
        try {
            res.send(
                new ResponseWrapper(await this.createInvoiceLink(user, data))
            )
        } catch (err) {
            next(err)
        }
    }

    async createPurchaseWithProvider(
        req: DataRequest<PurchaseReqDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { user, data } = req
            data.currency = 'USD'
            data.providerToken = this.config.providerPaymentId
            res.send(
                new ResponseWrapper(await this.createInvoiceLink(user, data))
            )
        } catch (err) {
            next(err)
        }
    }

    async createInvoiceLink(user: UserDTO, data: PurchaseReqDTO) {
        let newOrderId: string
        do {
            newOrderId = generateRandomString(23)
        } while ((await Invoice.isOrderIdAlready(newOrderId)) != null)
        const invoice = {
            title: data.title,
            description: data.description,
            payload: {
                orderId: newOrderId,
                value: data.numberCoin,
                gameType: data.gameType,
                purchaseType: data.purchaseType,
            },
            provider_token: data.providerToken,
            currency: data.currency,
            photo_url: data.photoUrl,
            prices: [
                {
                    label: data.label ?? `Buy ${data.numberCoin} Coin`,
                    amount: data.numberAmount,
                },
            ],
        }
        const response = await axios.post(
            `https://api.telegram.org/bot${this.config.telegramTokenBot}/createInvoiceLink`,
            invoice
        )

        await this.invoiceService.createInvoice(newOrderId, user.id, data)

        return response.data.result
    }

    async getOrderInvoice(orderId: string) {
        const invoiceDTO = plainToInstance(
            InvoiceDTO,
            await Invoice.isOrderIdAlready(orderId),
            {
                excludeExtraneousValues: true,
            }
        )
        return invoiceDTO
    }

    async paidInvoice(orderId: string) {
        await this.invoiceService.paidInvoice(orderId)
    }
}
