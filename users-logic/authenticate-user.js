const { validateUsername, validatePassword } = require('./helpers/validators')
const { CredentialsError } = require('users-errors')
const { models: { User } } = require('users-data')
const bcrypt = require('bcryptjs')
const { sanitizeDocument } = require( './helpers/sanitizers' )

function authenticateUser(username, password) {
    validateUsername(username)
    validatePassword(password)

    return (async () => {
        const user = await User.findOne({ username })
        
        if (!user || !bcrypt.compareSync(password, user.password)) throw new CredentialsError('wrong credentials')

        sanitizeDocument(user)
        
        return user.id
    })()
}

module.exports = authenticateUser