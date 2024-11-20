import { differenceInSeconds } from 'date-fns'
import { Message } from 'telegraf/typings/core/types/typegram'

export const generateRandomString = (
    length: number,
    type: 'default' | 'number' = 'default'
): string => {
    let characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()'
    if (type === 'number') {
        characters = '0123456789'
    }
    const charactersLength = characters.length
    let result = ''

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength)
        result += characters.charAt(randomIndex)
    }

    return result
}

export const generateOrderId = (length: number): string => {
    const crypto = require('crypto')
    return crypto.randomBytes(length).toString('hex')
}

export const getUsernameFromEmail = (email: string) => {
    const parts = email.split('@')
    const username = parts[0]
    return username
}

export const getUsernameFromGuest = () => {
    const prefix = 'user-'
    return `${prefix}${createFriendlyId()}`
}

function createFriendlyId(): string {
    const rawValue =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)

    // Ensure the length is at most 8 characters
    const shortenedValue = rawValue.substring(0, Math.min(rawValue.length, 8))

    let result = ''

    for (let i = 0; i < shortenedValue.length; i++) {
        if (i % 4 === 0 && result.length > 0) {
            result += '-'
        }
        result += shortenedValue[i]
    }

    if (result.endsWith('-')) {
        result = result.substring(0, result.length - 1)
    }

    return result
}
export const getObjectKeys = (obj: object) => {
    return Object.values(obj).join(', ')
}

export const getRandomItems = (arr: string[], num: number): string[] => {
    if (num > arr.length) {
        throw new Error(
            'Number of items to select is greater than the array length.'
        )
    }

    // Shuffle the array
    const shuffled = arr.sort(() => 0.5 - Math.random())

    // Get the first `num` items
    return shuffled.slice(0, num)
}

export const getCurrentUtcDateTime = (): Date => {
    return new Date()
}

export const isWithinSeconds = (
    dateToCompare: Date,
    expireAt: number
): boolean => {
    const now = getCurrentUtcDateTime()
    const diffInSeconds = differenceInSeconds(now, dateToCompare)
    return Math.abs(diffInSeconds) <= expireAt
}

export const decrypt = (
    encryptedText: string,
    secretKey: string,
    ivKey: string
): string => {
    const crypto = require('crypto')
    // Convert secretKey and ivKey to Buffer
    const key = crypto.createHash('sha256').update(secretKey).digest()
    const iv = Buffer.from(ivKey, 'hex')

    // Create decipher object
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)

    // Decrypt the string
    let decrypted = decipher.update(encryptedText, 'base64', 'utf8')
    decrypted += decipher.final('utf8')

    // console.log('Encrypted Text:', encryptedText)
    // console.log('Decrypted Text:', decrypted)

    return decrypted
}

export const verifyTelegramWebAppData = (
    telegramInitData: string,
    telegramToken: string
): boolean => {
    const initData = new URLSearchParams(telegramInitData)
    const hash = initData.get('hash')
    const dataToCheck: string[] = []

    initData.sort()
    initData.forEach(
        (val, key) => key !== 'hash' && dataToCheck.push(`${key}=${val}`)
    )
    const crypto = require('crypto')
    const secret = crypto
        .createHmac('sha256', 'WebAppData')
        .update(telegramToken)
        .digest()

    const _hash = crypto
        .createHmac('sha256', secret)
        .update(dataToCheck.join('\n'))
        .digest('hex')

    return hash === _hash
}

export const isSuccessfulPaymentMessage = (
    message: Message
): message is Message.SuccessfulPaymentMessage => {
    return (
        (message as Message.SuccessfulPaymentMessage).successful_payment !==
        undefined
    )
}

export const getNowUtc = () => {
    let nowUtc: Date = new Date(
        Date.UTC(
            new Date().getUTCFullYear(),
            new Date().getUTCMonth(),
            new Date().getUTCDate(),
            new Date().getUTCHours(),
            new Date().getUTCMinutes(),
            new Date().getUTCSeconds(),
            new Date().getUTCMilliseconds()
        )
    )

    return nowUtc
}

export const addOneHourToUtc = (): Date => {
    let nowUtc = getNowUtc()
    nowUtc.setUTCHours(nowUtc.getUTCHours() + 1)
    return nowUtc
}

export const getHoursDifferenceFromUtc = (inputDate: Date): number => {
    let nowUtc = getNowUtc()

    let differenceInMilliseconds = nowUtc.getTime() - inputDate.getTime()
    let differenceInHours = Math.floor(
        differenceInMilliseconds / (1000 * 60 * 60)
    )

    return differenceInHours
}

export const increaseDateByHours = (
    inputDate: Date,
    hoursDifference: number
): Date => {
    let newDate = new Date(inputDate)
    newDate.setHours(newDate.getHours() + hoursDifference)
    return newDate
}

export const getMinutesDifferenceFromUtc = (inputDate: Date): number => {
    let nowUtc = getNowUtc()

    let differenceInMilliseconds = nowUtc.getTime() - inputDate.getTime()
    let differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60))

    return differenceInMinutes
}

export const increaseDateByMinutes = (
    inputDate: Date,
    minutesDifference: number
): Date => {
    let newDate = new Date(inputDate.getTime() + minutesDifference * 60000)
    return newDate
}

export const convertToUtc = (localDate: Date): Date => {
    let utcDate = new Date(
        localDate.getTime() - localDate.getTimezoneOffset() * 60000
    )
    return utcDate
}

export const extractUserId = (url: string): string | null => {
    const tokenParam = url.match(/\/\?userId=([^&]+)/)
    if (tokenParam) {
        return tokenParam[1]
    }
    return null
}

export const extractWalletId = (url: string): string | null => {
    const tokenParam = url.match(/\/\?walletId=([^&]+)/)
    if (tokenParam) {
        return tokenParam[1]
    }
    return null
}
