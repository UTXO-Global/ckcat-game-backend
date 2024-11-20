// import {
//     BeforeInsert,
//     Column,
//     CreateDateColumn,
//     Entity,
//     EntityManager,
//     Index,
//     ObjectId,
//     ObjectIdColumn,
// } from 'typeorm'
// import { AppBaseEntity } from '../../../base/base.entity'
// import { AppDataSource } from '../../../database/connection'
// import Container from 'typedi'
// import { CacheManager } from '../../../caches'

// @Entity()
// export class Nonce extends AppBaseEntity {
//     @ObjectIdColumn()
//     _id: ObjectId

//     @Column()
//     nonce: string

//     static async isNonceAlready(nonce: string) {
//         const cacheManager = Container.get(CacheManager)
//         const cachedUser = await cacheManager.getObject<UserDTO>(
//             CacheKeys.user(id)
//         )
//         return await Nonce.findOne({
//             where: {
//                 nonce,
//             },
//         })
//     }

//     static async createNewNonce(
//         nonce: string,
//         manager: EntityManager = AppDataSource.manager
//     ) {
//         const n = new Nonce()
//         n.nonce = nonce

//         await manager.save(
//             Nonce.create({
//                 ...n,
//             })
//         )
//     }
// }
