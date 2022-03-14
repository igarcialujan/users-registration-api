const { models: { User } } = require('users-registration-data')
const { validateId, validateData } = require('./helpers/validators')
const { NotFoundError, ConflictError, CredentialsError } = require('users-registration-errors')
const bcrypt = require('bcryptjs')

/**
 * @param {*} id 
 * @param {*} data 
 */
function modifyUser(id, data) {
    validateId(id)
    validateData(data)

    return (async () => {
        try {
            const user = await User.findById(id)
            
            if (!user) throw new NotFoundError(`user with id ${id} not found`)
            
            let { password } = data 
        
            if (!bcrypt.compareSync(password, user.password)) throw new CredentialsError('wrong password')

            if (data.newName) {
                data.name = data.newName 

                delete data.newName 
            }

            if (data.newUsername) {
                data.username = data.newUsername 

                delete data.newUsername 
            }

            if (data.newEmail) {
                data.email = data.newEmail 

                delete data.newEmail 
            }
            
            if (data.newPassword) {
                data.password = data.newPassword 

                delete data.newPassword 
            }

            for (const key in data) {
                if (key === 'password')
                    user[key] = bcrypt.hashSync(data[key])
                else
                    user[key] = data[key]        
            }
        
            await user.save()
        } catch (error) {
            if (error.code === 11000)
                throw new ConflictError('user with that username or email already exists')
            
            throw error
        }
    })()
}

module.exports = modifyUser