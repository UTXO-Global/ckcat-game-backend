import { plainToInstance } from 'class-transformer'
import { AppDataSource } from '../../../../database/connection'
import { UserAdminGetListReqDTO } from '../dtos/user-admin-get-list-req.dto'
import { User } from '../../entities/user.entity'
import { UserAdminDTO } from '../dtos/user-admin.dto'
import { UserAdminGetReqDTO } from '../dtos/user-admin-get-req.dto'
import { Errors } from '../../../../utils/error'
import { parseFieldQueries } from '../../../../base/base.request'

export const UserAdminRepos = AppDataSource.getMongoRepository(User).extend({
    async getUsers(data: UserAdminGetListReqDTO) {
        const { pagination, sort, all, start, end, search, fromDate, toDate } =
            data

        const pipeline = this.getUsersQuery(
            search,
            sort,
            pagination,
            all,
            start,
            end,
            fromDate,
            toDate
        )

        const users = await UserAdminRepos.aggregate(pipeline).toArray()

        let totalUsers = 0

        if (all) {
            totalUsers = users.length
        } else {
            const countUsers = await UserAdminRepos.aggregate(
                this.getUsersCountQuery(search, fromDate, toDate)
            ).toArray()

            totalUsers = countUsers.length
        }

        pagination.total = totalUsers

        return {
            users: plainToInstance(UserAdminDTO, users, {
                excludeExtraneousValues: true,
            }),
            pagination,
        }
    },

    async getUser(data: UserAdminGetReqDTO) {
        const { userId } = data
        const userRepository = AppDataSource.getMongoRepository(User)

        const pipeline = [
            {
                $lookup: {
                    from: 'user_wallet',
                    localField: 'id',
                    foreignField: 'userId',
                    as: 'userWallet',
                },
            },
            {
                $unwind: {
                    path: '$userWallet',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $match: {
                    id: userId.toString(),
                },
            },
            {
                $project: {
                    id: 1,
                    firstName: 1,
                    lastName: 1,
                    username: 1,
                    gems: 1,
                    unlockTraining: 1,
                    lastLogin: 1,
                    createdAt: 1,
                    totalPlayingTime: 1,
                    totalLaunch: 1,
                    'userWallet.address': 1,
                },
            },
        ]

        const users = await userRepository.aggregate(pipeline).toArray()

        if (!users.length) {
            return Errors.UserNotFound
        }

        return plainToInstance(UserAdminDTO, users[0], {
            excludeExtraneousValues: true,
        })
    },

    getUsersQuery(
        search: string,
        sort: string,
        pagination,
        all: boolean,
        start: number,
        end: number,
        fromDate: Date,
        toDate: Date
    ) {
        const matches = {}
        const pipline = []
        const sortObj = {}
        const skip = (pagination.page - 1) * pagination.limit

        let startOfDate = null
        let endOfDate = null

        if (fromDate) {
            const startDate = new Date(fromDate)
            startOfDate = new Date(startDate.setUTCHours(0, 0, 0, 0))
        }

        if (toDate) {
            const endDate = new Date(toDate)
            endOfDate = new Date(endDate.setUTCHours(23, 59, 59, 999))
        }

        pipline.push(
            {
                $lookup: {
                    from: 'user_wallet',
                    localField: 'id',
                    foreignField: 'userId',
                    as: 'userWallet',
                },
            },
            {
                $unwind: {
                    path: '$userWallet',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    id: 1,
                    firstName: 1,
                    lastName: 1,
                    username: 1,
                    gems: 1,
                    unlockTraining: 1,
                    lastLogin: 1,
                    createdAt: 1,
                    totalPlayingTime: 1,
                    totalLaunch: 1,
                    'userWallet.address': 1,
                },
            }
        )

        if (search) {
            matches['username'] = {
                $regex: search,
                $options: 'i',
            }
        }

        if (startOfDate && endOfDate) {
            matches['createdAt'] = {
                $gte: startOfDate,
                $lte: endOfDate,
            }
        }

        if (Object.keys(matches).length > 0) {
            pipline.push({ $match: matches })
        }

        if (sort) {
            const sortQueries = parseFieldQueries(
                sort,
                new Set([
                    'gems',
                    'lastLogin',
                    'createdAt',
                    'totalPlayingTime',
                    'totalLaunch',
                    'unlockTraining',
                ])
            )

            for (const query of sortQueries) {
                let key = null
                if (
                    [
                        'lastLogin',
                        'createdAt',
                        'totalPlayingTime',
                        'totalLaunch',
                        'unlockTraining',
                        'gems',
                    ].includes(query.field)
                ) {
                    key = query.field
                } else {
                    key = 'userWallet' + '.' + query.field
                }

                sortObj[key] = query.value === 'asc' ? 1 : -1
            }

            pipline.push({
                $sort: sortObj,
            })
        }

        if (all) {
            if (start !== undefined && end !== undefined) {
                if (end < start) {
                    throw Errors.EndMustGreaterThanStart
                }

                pipline.push(
                    {
                        $skip: start,
                    },
                    {
                        $limit: end - start + 1,
                    }
                )

                return pipline
            }

            return pipline
        }

        pipline.push(
            {
                $skip: skip,
            },
            {
                $limit: pagination.limit,
            }
        )

        return pipline
    },

    getUsersCountQuery(search: string, fromDate: Date, toDate: Date) {
        const matches = {}
        const pipline = []

        let startOfDate = null
        let endOfDate = null

        if (fromDate) {
            const startDate = new Date(fromDate)
            startOfDate = new Date(startDate.setUTCHours(0, 0, 0, 0))
        }

        if (toDate) {
            const endDate = new Date(toDate)
            endOfDate = new Date(endDate.setUTCHours(23, 59, 59, 999))
        }

        pipline.push(
            {
                $lookup: {
                    from: 'user_wallet',
                    localField: 'id',
                    foreignField: 'userId',
                    as: 'userWallet',
                },
            },
            {
                $unwind: {
                    path: '$userWallet',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    id: 1,
                    firstName: 1,
                    lastName: 1,
                    username: 1,
                    gems: 1,
                    unlockTraining: 1,
                    lastLogin: 1,
                    createdAt: 1,
                    totalPlayingTime: 1,
                    totalLaunch: 1,
                    'userWallet.address': 1,
                },
            }
        )

        if (search) {
            matches['username'] = {
                $regex: search,
                $options: 'i',
            }
        }

        if (startOfDate && endOfDate) {
            matches['createdAt'] = {
                $gte: startOfDate,
                $lte: endOfDate,
            }
        }

        if (Object.keys(matches).length > 0) {
            pipline.push({ $match: matches })
        }

        return pipline
    },
})
