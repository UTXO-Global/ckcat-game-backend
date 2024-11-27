import socketIO, { Socket } from 'socket.io'
import { SocketLeaveRoomChannelDTO } from '../event-racing/dto/event-racing.dto'
import EventRacing from '../event-racing/models/event-racing.model'
import SportEventColossalBet from '../event-sport/models/sport-event-colo.model'
import { RedisService } from '../redis/redis.service'
import { SocketService } from '../socket/socket.service'
import { EventService } from './event.service'

export class EventSocketService {
    io: socketIO.Server
    socket: Socket
    eventService: EventService
    redisService: RedisService
    socketService: SocketService
    constructor(
        io: socketIO.Server,
        socket: Socket,
        eventService: EventService,
        redisService: RedisService,
        socketService: SocketService
    ) {
        this.io = io
        this.socket = socket
        this.eventService = eventService
        this.redisService = redisService
        this.socketService = socketService
        this.initRouter()
    }

    initRouter = async () => {
        this.socket.on('events/racing/get', this.getEventRacing)
        this.socket.on('events/sport/get', this.getEventSport)
        this.socket.on('events/leave-room', this.leaveRoom)
    }

    getEventRacing = async (eventId: number) => {
        const event = (await EventRacing.getRacingEventDetail(eventId)) ?? null
        if (event) {
            await this.eventService.handleSetSocketIdChannel(
                eventId.toString(),
                this.socket.id
            )
        }
        this.socket.emit('events/racing/get', event)
    }

    getEventSport = async (eventId: number) => {
        const event = (await SportEventColossalBet.getDetail(eventId)) ?? null
        if (event) {
            await this.eventService.handleSetSocketIdChannel(
                eventId.toString(),
                this.socket.id
            )
        }
        this.socket.emit('events/sport/get', event)
    }

    leaveRoom = async (data: SocketLeaveRoomChannelDTO) => {
        if (data.key && data.socketId) {
            await this.eventService.handleLeaveChannel(
                data.key.toString(),
                data.socketId
            )
        }
    }
}
