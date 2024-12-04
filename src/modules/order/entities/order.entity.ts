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
        const id = new ObjectId(orderId);
        return await Order.findOne({
            where: {
                userId: userId,
                _id: id,
            },
        })
    }

    static async getOrders(data: OrderListReqDTO) {
        const { pagination } = data
        const res = await Order.find({
            where: {
                userId: data.userId,
            },
            skip: pagination.getOffset(),  // Offset to skip
            take: pagination.limit,
        })

        pagination.total = await Order.count();
        return {
            data: res,
            pagination: pagination,
        }
    }
}
