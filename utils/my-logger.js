const { createLogger, transports: { File, Console }, format: { combine, timestamp, label, printf } } = require('winston')

const myFormat = printf(({ level, message, label, timestamp }) => {
    return `[${label}] ${timestamp} ${level}: ${message}`;
})

const logger = createLogger({
    level: 'debug',
    format: combine(
        label({ label: 'USERS-REGISTRATION-API' }),
        timestamp(),
        myFormat
    ),
    transports: [
        new File({ filename: 'server.log' }),
        new Console()
    ]
})

module.exports = logger