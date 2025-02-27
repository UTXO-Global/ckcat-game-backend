import { Column, Entity, ObjectIdColumn } from 'typeorm'
import { AppBaseEntity } from '../../../base/base.entity'
import { ObjectId } from 'mongodb'
import { PackageTypes } from '../types/package-type.type'

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
    numberDayReceived: number

    @Column()
    type: string

    static async getPackages() {
        return await Package.find()
    }

    static async getPackage(packageId: string) {
        const id = new ObjectId(packageId)
        return await Package.findOne({
            where: {
                _id: id,
            },
        })
    }

    static async getPackageByType(type: PackageTypes) {
        return await Package.findOne({
            where: {
                type,
            },
        })
    }
}
