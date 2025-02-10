import {
    Column,
    Entity,
    EntityManager,
    ObjectIdColumn,
} from 'typeorm'
import { AppBaseEntity } from '../../../base/base.entity'
import { AppDataSource } from '../../../database/connection'
import { plainToInstance } from 'class-transformer'
import { OrderDTO } from '../dtos/order.dto'
import { ObjectId } from 'mongodb';
import { OrderListReqDTO } from '../dtos/order-list-req.dto'

@Entity()
export class Order extends AppBaseEntity {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    orderId: string

    @Column()
    userId: string

    @Column()
    packageId: string

    @Column()
    price: number

    @Column()
    status: string


    static async createOrder(
        data: OrderDTO,
        manager: EntityManager = AppDataSource.manager
    ) {
        const createFields = plainToInstance(OrderDTO, data, {
            excludeExtraneousValues: true,
        })
        
        return await manager.save(
            Order.create({
                ...createFields,
            })
        )
    }

    static async getOrder(userId: string, orderId: string) {
        // const id = new ObjectId(orderId);
        return await Order.findOne({
            where: {
                userId: userId,
                // _id: id,
                orderId
            },
        })
    }

    static async getOrders(data: OrderListReqDTO) {
        const { pagination } = data
        const [transactions, totalCount] = await Order.findAndCount({
            where: {
                userId: data.userId,
            },
            order: {
                createdAt: 'DESC',  // Order by createdAt in descending order
            },
            skip: pagination.getOffset(),  // Offset to skip
            take: pagination.limit,
        })

        pagination.total = totalCount;
        return {
            data: transactions,
            pagination: pagination,
        }
    }

    static async getOrderById(orderId: string) {
        // const id = new ObjectId(orderId);
        return await Order.findOne({
            where: {
                // _id: id,
                orderId
            },
        })
    }

    static async updateOrderStatus(
        orderId: string,
        status: string,
        manager: EntityManager = AppDataSource.manager
    ) {
        // const id = new ObjectId(orderId);
        await manager.update(Order, { orderId }, { status })
    }
}
