import {
    EventProcessingDTO,
    SocketIdOfChannelDTO,
} from './dto/event.dto'
import { RedisService } from '../redis/redis.service'

export class EventService {
    redisService: RedisService
    constructor(redisService: RedisService) {
        this.redisService = redisService
    }

    getCompletedScanEvent = async (eventKey: string) => {
        const eventProcessingDTO =
            (JSON.parse(
                await this.redisService.client.get(eventKey)
            ) as EventProcessingDTO) ?? null

        return eventProcessingDTO
    }

    setEventProcessingToRedis = async (eventKey: string, value: boolean) => {
        let eventProcessingDTO = new EventProcessingDTO()
        const now = new Date()
        if (value) {
            eventProcessingDTO = await this.getCompletedScanEvent(eventKey)
            eventProcessingDTO.completed = value
            console.log(
                eventKey,
                '=',
                (new Date().getTime() - eventProcessingDTO.completedTime) /
                    1000,
                's'
            )
        } else {
            eventProcessingDTO.completed = false
            const timeExpired = now.setSeconds(now.getSeconds() + 15 * 60)
            eventProcessingDTO.timestampExpired = timeExpired
            eventProcessingDTO.completedTime = new Date().getTime()
        }

        if (eventProcessingDTO)
            await this.redisService.client.set(
                eventKey, // EVENT_RACING_PROCESSING_KEY,
                JSON.stringify(eventProcessingDTO)
            )
    }

    checkEventProcessingFromRedis = async (eventKey: string) => {
        const eventProcessingDTO = await this.getCompletedScanEvent(eventKey)
        if (
            !eventProcessingDTO ||
            eventProcessingDTO?.completed ||
            new Date().getTime() > eventProcessingDTO?.timestampExpired
        ) {
            return true
        }
        return false
    }

    async getChannel(key: string) {
        return await this.redisService.client.get(key)
    }

    async getExChannel(key: string) {
        return await this.redisService.client.ttl(key)
    }

    async setExChannel(key: string, seconds: number, value: string) {
        await this.redisService.client.setEx(key, seconds, value)
    }

    // set channel  (key === eventId) , value socketId[]
    async handleSetSocketIdChannel(key: string, socketId: string) {
        // time expired channel ( 1 day)
        const secondsExpired = 24 * 60 * 60

        // get channel
        let channel = JSON.parse(
            await this.getChannel(key)
        ) as SocketIdOfChannelDTO
        if (!channel) {
            channel = new SocketIdOfChannelDTO()
            channel.socketIds = []
        }

        const existedSocketId = channel?.socketIds?.filter(
            (id) => id === socketId
        )

        // if not exited => add socketId to channel
        if (existedSocketId.length === 0) {
            channel.socketIds.push(socketId)
        }
        // update time expired and value for channel
        await this.setExChannel(key, secondsExpired, JSON.stringify(channel))
    }

    handleGetSocketIdChannel = async (key: string) => {
        let socketIds: string[] = []
        const socketIdOfChannel = JSON.parse(
            await this.getChannel(key)
        ) as SocketIdOfChannelDTO
        if (socketIdOfChannel && socketIdOfChannel?.socketIds?.length > 0) {
            socketIdOfChannel.socketIds.forEach((socket) => {
                socketIds.push(socket)
            })
        }
        return socketIds
    }

    async handleLeaveChannel(key: string, socketId: string) {
        let channel = JSON.parse(
            await this.getChannel(key)
        ) as SocketIdOfChannelDTO
        if (channel && channel.socketIds.length > 0) {
            channel.socketIds = [...channel.socketIds].filter(
                (id) => id !== socketId
            )
            await this.setExChannel(
                key,
                await this.getExChannel(key),
                JSON.stringify(channel)
            )
        }
    }

    getMapKey = (gwRaceCode: string) => {
        return gwRaceCode.split('_')?.[2] ?? null
    }
}
