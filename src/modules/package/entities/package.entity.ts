import {
    Column,
    Entity,
    ObjectIdColumn,
} from 'typeorm'
import { AppBaseEntity } from '../../../base/base.entity'
import { ObjectId } from 'mongodb';

@Entity()
export class Package extends AppBaseEntity {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    id: number

    @Column()
    name: string

    @Column()
    purchaseID: string

    @Column()
    gemReceived: number

    @Column()
    price: number

    @Column()
    vipPoint: number

    @Column()
    numberDayReceived:  number

    static async getPackages() {
        return await Package.find();
    }

    static async getPackage(packageId: string) {
        const id = new ObjectId(packageId);
        return await Package.findOne({
            where: {
                _id: id,
            },
        })
    }
}
