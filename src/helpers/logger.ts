import winston from 'winston'

const { combine, timestamp, prettyPrint, colorize } = winston.format

export const logger = winston.createLogger({
    level: 'info',
    format: combine(timestamp(), prettyPrint(), colorize()),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
    ],
})


logger.add(
    new winston.transports.Console({
        format: winston.format.simple(),
    })
)
