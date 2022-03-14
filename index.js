require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const { mongoose } = require('users-registration-data')
const cors = require('cors')
const { 
    registerUser, 
    authenticateUser, 
    retrieveUser, 
    modifyUser,
    unregisterUser
} = require('./handlers')
const logger = require('./utils/my-logger')
const { env: { PORT }, argv: [, , port = PORT || 8080] } = process

logger.info('starting server');

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1/users-api')
            
        const server = express()

        server.use(cors())

        const api = express.Router()

        const jsonBodyParser = bodyParser.json()

        server.get('/', (req, res) => {
            res.json('Welcome to Users Registration API')
        })

        api.post('/users', jsonBodyParser, registerUser)

        api.post('/users/auth', jsonBodyParser, authenticateUser)

        api.get('/users', retrieveUser)

        api.patch('/users', jsonBodyParser, modifyUser)

        api.delete('/users', jsonBodyParser, unregisterUser)

        api.all('*', (req, res) => {
            res.status(404).json({ message: 'sorry, this endpoint is not available' })
        })

        server.use('/api', api)

        server.listen(port, () => logger.info(`server up and listening on port ${port}...`))

        process.on('SIGINT', () => {
            logger.info('stopping server')

            process.exit(0)
        })
    } catch (error) {
        logger.error(error)
    }
})()
