const { models: { User } } = require('users-registration-data')
const { validateId } = require('./helpers/validators')
const { NotFoundError } = require('users-registration-errors')
const { sanitizeDocument } = require('./helpers/sanitizers')

function retrieveUser(id) {
    validateId(id)

    return (async () => {
        try {
            const user = await User.findById(id).lean()
            
            if (!user) throw new NotFoundError(`user with id ${id} not found`)
    
            sanitizeDocument(user)
    
            delete user.password
    
            return user
        } catch(error) {
            throw error
        }
    })()
}

module.exports = retrieveUser