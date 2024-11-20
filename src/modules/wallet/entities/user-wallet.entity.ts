import { Column, Entity, ObjectId, ObjectIdColumn } from "typeorm";
import { AppBaseEntity } from "../../../base/base.entity";

@Entity()
export class UserWallet extends AppBaseEntity {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    userId: string

    @Column()
    appTelegramUrl: string

}