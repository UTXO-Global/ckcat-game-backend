import { Inject, Service } from 'typedi'
import { Config } from '../../configs'
import { Errors } from '../../utils/error'
import { UserWallet } from '../wallet/entities/user-wallet.entity'
import axios from 'axios'
import { InternalRefferalReqDTO } from './dtos/internal-refferal.dto'
import { InternalLeaderboardReqDTO } from './dtos/internal-leaderboard.dto'

@Service()
export class InternalService {
    constructor(@Inject() private config: Config) {}
    async retrieveDailyCheckIn(walletAddress: string) {
        try {
            const response = await axios.post(
                `${this.config.apiUrl}/ckcat/internal/daily-checkin`,
                {
                    user_address: walletAddress,
                },
                {
                    headers: {
                        'API-KEY': this.config.apiKey,
                    },
                }
            )
            if (!response || !response.data) {
                throw Errors.InternalServiceError
            }

            return response.data
        } catch (error) {
            if (error.response) {
                throw {
                    status: error.response.status,
                    message: error.response.data?.message || 'Unknown error',
                }
            } else {
                throw Errors.InternalServiceError
            }
        }
    }

    async dailyCheckin(userId: string) {
        const userWallet = await UserWallet.getWalletByUserId(userId)
        if (!userWallet) {
            throw Errors.UserNotFound
        }

        const checkIn = await this.retrieveDailyCheckIn(userWallet.address)
        return checkIn
    }

    async retrieveGetProfile(walletAddress: string) {
        try {
            const response = await axios.get(
                `${this.config.apiUrl}/ckcat/internal/profile/${walletAddress}`,
                {
                    headers: {
                        'API-KEY': this.config.apiKey,
                    },
                }
            )
            if (!response || !response.data) {
                throw Errors.InternalServiceError
            }
            return response.data
        } catch (error) {
            if (error.response) {
                throw {
                    status: error.response.status,
                    message: error.response.data?.message || 'Unknown error',
                }
            } else {
                throw Errors.InternalServiceError
            }
        }
    }

    async getProfile(userId: string) {
        const userWallet = await UserWallet.getWalletByUserId(userId)
        if (!userWallet) {
            throw Errors.UserNotFound
        }

        const profile = await this.retrieveGetProfile(userWallet.address)

        return profile
    }

    async retrieveRefferal(walletAddress: string, code: string) {
        try {
            const response = await axios.post(
                `${this.config.apiUrl}/ckcat/internal/referral`,
                {
                    referred_address: walletAddress,
                    ref_code: code,
                },
                {
                    headers: {
                        'API-KEY': this.config.apiKey,
                    },
                }
            )
            if (!response || !response.data) {
                throw Errors.InternalServiceError
            }

            return response.data
        } catch (error) {
            if (error.response) {
                throw {
                    status: error.response.status,
                    message: error.response.data?.message || 'Unknown error',
                }
            } else {
                throw Errors.InternalServiceError
            }
        }
    }

    async addRefferal(data: InternalRefferalReqDTO) {
        const { userId, code } = data

        const userWallet = await UserWallet.getWalletByUserId(userId)
        if (!userWallet) {
            throw Errors.UserNotFound
        }

        const result = await this.retrieveRefferal(userWallet.address, code)
        return result
    }

    async retrieveLeaderboard(
        walletAddress: string,
        page?: number,
        limit?: number
    ) {
        try {
            const params = new URLSearchParams()

            if (walletAddress) params.append('walletAddress', walletAddress)
            if (page) params.append('page', page.toString())
            if (limit) params.append('limit', limit.toString())
            const response = await axios.get(
                `${
                    this.config.apiUrl
                }/ckcat/internal/leaderboard?${params.toString()}`,

                {
                    headers: {
                        'API-KEY': this.config.apiKey,
                    },
                }
            )
            if (!response || !response.data) {
                throw Errors.InternalServiceError
            }
            return response.data
        } catch (error) {
            if (error.response) {
                throw {
                    status: error.response.status,
                    message: error.response.data?.message || 'Unknown error',
                }
            } else {
                throw Errors.InternalServiceError
            }
        }
    }

    async getLeaderboard(data: InternalLeaderboardReqDTO) {
        const { userId, page, limit } = data

        const userWallet = await UserWallet.getWalletByUserId(userId)
        if (!userWallet) {
            throw Errors.UserNotFound
        }

        const result = await this.retrieveLeaderboard(
            userWallet.address,
            page,
            limit
        )
        return result
    }
}
