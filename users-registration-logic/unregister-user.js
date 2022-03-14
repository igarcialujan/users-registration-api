const { models: { User } } = require('users-registration-data')
const { validateId, validatePassword } = require('./helpers/validators')
const { CredentialsError } = require('users-registration-errors')
const bcrypt = require('bcryptjs')

/**
 * @param {*} id 
 * @param {*} password 
 */
function unregisterUser(id, password) {
    validateId(id)
    validatePassword(password)

    return (async () => {
        try {
            const user = await User.findById(id)
            
            if (!user || !bcrypt.compareSync(password, user.password)) 
                throw new CredentialsError('wrong credentials')
        
            await user.remove()      
        } catch (error) {
            throw error
        }
    })()
}

module.exports = unregisterUser 