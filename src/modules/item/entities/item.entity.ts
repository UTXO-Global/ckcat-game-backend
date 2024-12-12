import {
    Column,
    Entity,
    ObjectIdColumn,
} from 'typeorm'
import { AppBaseEntity } from '../../../base/base.entity'
import { ObjectId } from 'mongodb';


@Entity()
export class Item extends AppBaseEntity {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    name: string

    @Column()
    key: string

    @Column()
    gems: number

    @Column()
    type: string
    
    static async getItems(type: string) {
        return await Item.find({
            where: {
                type,
            },
        })
    }

    static async getItem(itemId: string) {
        const id = new ObjectId(itemId);
        return await Item.findOne({
            where: {
                _id: id,
            },
        })
    }
}
