import { AppDataSource } from '../../../database/connection'
import { User } from '../../user/entities/user.entity'
import { DashboardGetListNewPlayerReqDTO } from '../dtos/dashboard-get-list-new-player.dto'
import { plainToInstance } from 'class-transformer'
import { NewPlayerDTO } from '../dtos/new-player.dto'
import { DashboardGetListActivePlayerReqDTO } from '../dtos/dashboad-get-list-active-player.dto'
import { GameSession } from '../../game-session/entities/game-session.entity'
import { ActivePlayerDTO } from '../dtos/active-player.dto'
import { Errors } from '../../../utils/error'
import { parseFieldQueries } from '../../../base/base.request'
import { DashboardGetNumOfPlayerReqDTO } from '../dtos/dashboad-get-num-of-player.dto'
import { AnalysisDTO } from '../dtos/analysis.dto'
import { AnalysisType } from '../types/dashboard.types'
import { DashboardGetNumOfWalletReqDTO } from '../dtos/dashboad-get-num-of-wallet.dto'
import { WalletAnalysisDTO } from '../dtos/wallet-analysis.dto'
import { UserWallet } from '../../wallet/entities/user-wallet.entity'
import { GameStats } from '../../game-stats/entities/game-stats.entity'

export const DashboardRepos = AppDataSource.getMongoRepository(User).extend({
    async getNewPlayers(data: DashboardGetListNewPlayerReqDTO) {
        const { pagination, fromDate, toDate, all, start, end } = data

        const startDate = new Date(fromDate)
        const startOfDate = new Date(startDate.setUTCHours(0, 0, 0, 0))
        const endDate = new Date(toDate)
        const endOfDate = new Date(endDate.setUTCHours(23, 59, 59, 999))

        const pipeline = this.getNewPlayersQuery(
            pagination,
            startOfDate,
            endOfDate,
            all,
            start,
            end
        )
        const chartItems = await DashboardRepos.aggregate(pipeline).toArray()

        const allUsers = await DashboardRepos.find({
            where: {
                createdAt: {
                    $gte: startOfDate,
                    $lte: endOfDate,
                },
            },
        })

        pagination.total = allUsers.length

        if (all) {
            pagination.total = chartItems.length
        }

        return {
            chartItems: plainToInstance(NewPlayerDTO, chartItems, {
                excludeExtraneousValues: true,
            }),
            pagination,
        }
    },

    async getActivePlayers(data: DashboardGetListActivePlayerReqDTO) {
        const { pagination, fromDate, toDate, all, start, end, sort } = data

        const startDate = new Date(fromDate)
        const startOfDate = new Date(startDate.setUTCHours(0, 0, 0, 0))
        const endDate = new Date(toDate)
        const endOfDate = new Date(endDate.setUTCHours(23, 59, 59, 999))

        const pipeline = this.getActivePlayersQuery(
            pagination,
            sort,
            startOfDate,
            endOfDate,
            all,
            start,
            end
        )

        const gameSessionRepository =
            AppDataSource.getMongoRepository(GameSession)
        const chartItems = await gameSessionRepository
            .aggregate(pipeline)
            .toArray()

        const allItems = await gameSessionRepository
            .aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: startOfDate,
                            $lte: endOfDate,
                        },
                    },
                },
                {
                    $group: {
                        _id: {
                            userId: '$userId',
                            createdAt: {
                                $dateToString: {
                                    format: '%Y-%m-%d',
                                    date: '$createdAt',
                                },
                            },
                        },
                    },
                },
            ])
            .toArray()

        pagination.total = allItems.length

        return {
            chartItems: plainToInstance(ActivePlayerDTO, chartItems, {
                excludeExtraneousValues: true,
            }),
            pagination,
        }
    },

    // async getNumOfPlayers(data: DashboardGetNumOfPlayerReqDTO) {
    //     const { fromDate, toDate, type } = data
    //     const gameSessionRepo = AppDataSource.getMongoRepository(GameSession)

    //     const startDate = new Date(fromDate)
    //     const startOfDate = new Date(startDate.setUTCHours(0, 0, 0, 0))
    //     const endDate = new Date(toDate)
    //     const endOfDate = new Date(endDate.setUTCHours(23, 59, 59, 999))

    //     const pipline = []

    //     pipline.push({
    //         $match: {
    //             createdAt: {
    //                 $gte: startOfDate,
    //                 $lte: endOfDate,
    //             },
    //         },
    //     })

    //     if (type === AnalysisType.DAU) {
    //         pipline.push(
    //             {
    //                 $group: {
    //                     _id: {
    //                         $dateToString: {
    //                             format: '%Y-%m-%d',
    //                             date: '$createdAt',
    //                         },
    //                     },
    //                     uniqueUsers: { $addToSet: '$userId' },
    //                 },
    //             },
    //             {
    //                 $addFields: {
    //                     numOfUsers: { $size: '$uniqueUsers' },
    //                 },
    //             },
    //             {
    //                 $project: {
    //                     _id: 0,
    //                     date: '$_id',
    //                     numOfUsers: 1,
    //                 },
    //             },
    //             {
    //                 $sort: {
    //                     date: 1,
    //                 },
    //             }
    //         )
    //     } else {
    //         pipline.push(
    //             {
    //                 $group: {
    //                     _id: {
    //                         $dateToString: {
    //                             format: '%m',
    //                             date: '$createdAt',
    //                         },
    //                     },
    //                     uniqueUsers: { $addToSet: '$userId' },
    //                 },
    //             },
    //             {
    //                 $addFields: {
    //                     numOfUsers: { $size: '$uniqueUsers' },
    //                 },
    //             },
    //             {
    //                 $project: {
    //                     _id: 0,
    //                     month: '$_id',
    //                     numOfUsers: 1,
    //                 },
    //             },
    //             {
    //                 $sort: {
    //                     month: 1,
    //                 },
    //             }
    //         )
    //     }

    //     const chartItems = await gameSessionRepo.aggregate(pipline).toArray()

    //     const createdPipline = []

    //     createdPipline.push({
    //         $match: {
    //             createdAt: {
    //                 $gte: startOfDate,
    //                 $lte: endOfDate,
    //             },
    //         },
    //     })

    //     if (type === AnalysisType.DAU) {
    //         createdPipline.push(
    //             {
    //                 $group: {
    //                     _id: {
    //                         $dateToString: {
    //                             format: '%Y-%m-%d',
    //                             date: '$createdAt',
    //                         },
    //                     },
    //                     uniqueUsers: { $addToSet: '$id' },
    //                 },
    //             },
    //             {
    //                 $addFields: {
    //                     numOfUsers: { $size: '$uniqueUsers' },
    //                 },
    //             },
    //             {
    //                 $project: {
    //                     _id: 0,
    //                     date: '$_id',
    //                     numOfUsers: 1,
    //                 },
    //             },
    //             {
    //                 $sort: {
    //                     date: 1,
    //                 },
    //             }
    //         )
    //     } else {
    //         createdPipline.push(
    //             {
    //                 $group: {
    //                     _id: {
    //                         $dateToString: {
    //                             format: '%m',
    //                             date: '$createdAt',
    //                         },
    //                     },
    //                     uniqueUsers: { $addToSet: '$id' },
    //                 },
    //             },
    //             {
    //                 $addFields: {
    //                     numOfUsers: { $size: '$uniqueUsers' },
    //                 },
    //             },
    //             {
    //                 $project: {
    //                     _id: 0,
    //                     month: '$_id',
    //                     numOfUsers: 1,
    //                 },
    //             },
    //             {
    //                 $sort: {
    //                     month: 1,
    //                 },
    //             }
    //         )
    //     }

    //     const createdChartItems = await DashboardRepos.aggregate(
    //         createdPipline
    //     ).toArray()

    //     return plainToInstance(
    //         AnalysisDTO,
    //         { activeUsers: chartItems, createdUsers: createdChartItems },
    //         {
    //             excludeExtraneousValues: true,
    //         }
    //     )
    // },

    async getNumOfPlayers(data: DashboardGetNumOfPlayerReqDTO) {
        const { fromDate, toDate, type } = data
        const gameStatsRepo = AppDataSource.getMongoRepository(GameStats)

        const startDate = new Date(fromDate)
        const startOfDate = new Date(startDate.setUTCHours(0, 0, 0, 0))
        const endDate = new Date(toDate)
        const endOfDate = new Date(endDate.setUTCHours(23, 59, 59, 999))

        const pipline = []

        pipline.push({
            $match: {
                statsDate: {
                    $gte: startOfDate,
                    $lte: endOfDate,
                },
            },
        })

        if (type === AnalysisType.DAU) {
            pipline.push(
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: '%Y-%m-%d',
                                date: '$statsDate',
                            },
                        },
                        totalActiveUsers: { $first: '$totalActiveUsers' },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        date: '$_id',
                        totalActiveUsers: 1,
                    },
                },
                {
                    $sort: {
                        date: 1,
                    },
                }
            )
        } else {
            pipline.push(
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: '%m',
                                date: '$statsDate',
                            },
                        },
                        totalActiveUsers: { $first: '$totalActiveUsers' }, // Lấy tổng người dùng đã tạo tài khoản
                    },
                },
                {
                    $project: {
                        _id: 0,
                        month: '$_id',
                        totalActiveUsers: 1,
                    },
                },
                {
                    $sort: {
                        month: 1,
                    },
                }
            )
        }

        // Truy vấn dữ liệu từ GameStats
        const chartItems = await gameStatsRepo.aggregate(pipline).toArray()

        // Lấy dữ liệu của số người chơi đã tạo tài khoản
        const createdPipline = []

        createdPipline.push({
            $match: {
                statsDate: {
                    $gte: startOfDate,
                    $lte: endOfDate,
                },
            },
        })

        if (type === AnalysisType.DAU) {
            createdPipline.push(
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: '%Y-%m-%d',
                                date: '$statsDate',
                            },
                        },
                        totalCreatedUsers: { $first: '$totalCreatedUsers' }, // Lấy tổng người chơi hoạt động
                    },
                },
                {
                    $project: {
                        _id: 0,
                        date: '$_id',
                        totalCreatedUsers: 1,
                    },
                },
                {
                    $sort: {
                        date: 1,
                    },
                }
            )
        } else {
            createdPipline.push(
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: '%m',
                                date: '$statsDate',
                            },
                        },
                        totalCreatedUsers: { $first: '$totalCreatedUsers' }, // Lấy tổng người tạo tài khoản
                    },
                },
                {
                    $project: {
                        _id: 0,
                        month: '$_id',
                        totalCreatedUsers: 1,
                    },
                },
                {
                    $sort: {
                        month: 1,
                    },
                }
            )
        }

        // Truy vấn dữ liệu của người chơi đã tạo tài khoản
        const createdChartItems = await gameStatsRepo
            .aggregate(createdPipline)
            .toArray()

        return plainToInstance(
            AnalysisDTO,
            { activeUsers: chartItems, createdUsers: createdChartItems },
            {
                excludeExtraneousValues: true,
            }
        )
    },

    getNewPlayersQuery(
        pagination,
        startOfDate: Date,
        endOfDate: Date,
        all: boolean,
        start: number,
        end: number
    ) {
        const skip = (pagination.page - 1) * pagination.limit

        if (all) {
            if (start !== undefined && end !== undefined) {
                if (end < start) {
                    throw Errors.EndMustGreaterThanStart
                }

                return [
                    {
                        $match: {
                            createdAt: {
                                $gte: startOfDate, // Include records from startDate
                                $lte: endOfDate, // Include records up to endDate
                            },
                        },
                    },
                    {
                        $project: {
                            username: 1,
                            firstName: 1,
                            lastName: 1,
                        },
                    },
                    { $skip: start },
                    { $limit: end - start + 1 },
                ]
            }

            return [
                {
                    $match: {
                        createdAt: {
                            $gte: startOfDate, // Include records from startDate
                            $lte: endOfDate, // Include records up to endDate
                        },
                    },
                },
                {
                    $project: {
                        username: 1,
                        firstName: 1,
                        lastName: 1,
                    },
                },
            ]
        }

        return [
            {
                $match: {
                    createdAt: {
                        $gte: startOfDate, // Include records from startDate
                        $lte: endOfDate, // Include records up to endDate
                    },
                },
            },
            {
                $project: {
                    username: 1,
                    firstName: 1,
                    lastName: 1,
                },
            },
            { $skip: skip },
            { $limit: pagination.limit },
        ]
    },

    getActivePlayersQuery(
        pagination,
        sort: string,
        startOfDate: Date,
        endOfDate: Date,
        all: boolean,
        start: number,
        end: number
    ) {
        const pipline = []
        const sortObj = {}
        const skip = (pagination.page - 1) * pagination.limit

        pipline.push(
            {
                $match: {
                    createdAt: {
                        $gte: startOfDate,
                        $lte: endOfDate,
                    },
                },
            },
            {
                $lookup: {
                    from: 'user',
                    localField: 'userId',
                    foreignField: 'id',
                    as: 'userDetail',
                },
            },
            {
                $unwind: {
                    path: '$userDetail',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    dayOfWeek: {
                        $dayOfWeek: '$createdAt',
                    },
                    month: {
                        $month: '$createdAt',
                    },
                    'userDetail.username': 1,
                    'userDetail.firstName': 1,
                    'userDetail.lastName': 1,
                    'userDetail.lastLogin': 1,
                    createdAt: 1,
                },
            }
        )

        if (sort) {
            const sortQueries = parseFieldQueries(sort, new Set(['lastLogin']))

            for (const query of sortQueries) {
                sortObj['userDetail.' + query.field] =
                    query.value === 'asc' ? 1 : -1
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

                pipline.push({ $skip: start }, { $limit: end - start + 1 })

                return pipline
            }

            return pipline
        }

        pipline.push({ $skip: skip }, { $limit: pagination.limit })

        return pipline
    },

    async getNumOfWallets(data: DashboardGetNumOfWalletReqDTO) {
        const { fromDate, toDate, type } = data
        const userWalletRepo = AppDataSource.getMongoRepository(UserWallet)

        const startDate = new Date(fromDate)
        const startOfDate = new Date(startDate.setUTCHours(0, 0, 0, 0))
        const endDate = new Date(toDate)
        const endOfDate = new Date(endDate.setUTCHours(23, 59, 59, 999))

        const pipline = []

        pipline.push({
            $match: {
                updatedDateWallet: {
                    $gte: startOfDate,
                    $lte: endOfDate,
                },
            },
        })

        if (type === AnalysisType.DAU) {
            pipline.push(
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: '%Y-%m-%d',
                                date: '$updatedDateWallet',
                            },
                        },
                        uniqueUsers: { $addToSet: '$userId' },
                    },
                },
                {
                    $addFields: {
                        numOfWallets: { $size: '$uniqueUsers' },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        date: '$_id',
                        numOfWallets: 1,
                    },
                },
                {
                    $sort: {
                        date: 1,
                    },
                }
            )
        } else {
            pipline.push(
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: '%m',
                                date: '$updatedDateWallet',
                            },
                        },
                        uniqueUsers: { $addToSet: '$userId' },
                    },
                },
                {
                    $addFields: {
                        numOfWallets: { $size: '$uniqueUsers' },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        month: '$_id',
                        numOfWallets: 1,
                    },
                },
                {
                    $sort: {
                        month: 1,
                    },
                }
            )
        }

        const walletChartItems = await userWalletRepo
            .aggregate(pipline)
            .toArray()

        return plainToInstance(
            WalletAnalysisDTO,
            { wallet: walletChartItems },
            {
                excludeExtraneousValues: true,
            }
        )
    },
})
