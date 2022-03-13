const { models: { User } } = require('users-data')
const { validateId } = require('./helpers/validators')
const { NotFoundError } = require('users-errors')
const { sanitizeDocument } = require('./helpers/sanitizers')

function retrieveUser(id) {
    validateId(id)

    return (async () => {
        const user = await User.findById(id).lean()
        
        if (!user) throw new NotFoundError(`user with id ${id} not found`)

        sanitizeDocument(user)

        delete user.password

        return user
    })()
}

module.exports = retrieveUser