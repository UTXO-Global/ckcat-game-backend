// import {
//     convertToUtc,
//     getHoursDifferenceFromUtc,
//     getMinutesDifferenceFromUtc,
//     increaseDateByHours,
//     increaseDateByMinutes,
// } from './utils'

import { Telegraf } from 'telegraf'
import { User } from './modules/user/entities/user.entity'
import axios from 'axios'
import { generateRandomString } from './utils'

// let inputLocalDate = new Date(2024, 7, 12, 8, 0, 0)

// let minuteDifference = getMinutesDifferenceFromUtc(inputLocalDate)

// let minuteIncrease = Math.floor(minuteDifference / 3)

// console.log(`Sự khác biệt về phút: ${minuteDifference}`)

// let newDate = increaseDateByMinutes(inputLocalDate, minuteIncrease * 3)
// console.log(
//     `Ngày giờ phút sau khi tăng: ${newDate.toLocaleDateString()} ${newDate.toLocaleTimeString()}`
// )

const getChatMember = async () => {
    const bot = new Telegraf('7267058669:AAFk5K1cKearJaEQaaEm8sFaJ-bNV8vXjsM')
    try {
        const res = await bot.telegram.getChatMember(
            '@bmCommunity',
            Number('6469663868')
        )
        console.log('User: ', res['status'])
    } catch (error) {
        console.log('Error: ', error)
    }
}

const updateCoinToRedisLeaderBoard = async () => {
    await User.updateCoinToRedisLeaderBoard()
}
// updateCoinToRedisLeaderBoard()
// getChatMember()
const buySellBitCoin = async () => {
    const response = await axios.get(
        `https://api.binance.com/api/v3/avgPrice?symbol=BTCUSDT`
    )
    console.log('Res: ', Number(response.data.price))
}
// buySellBitCoin()
const generateKey = () => {
    console.log('KEY ========> ', generateRandomString(0))
}
generateKey()
