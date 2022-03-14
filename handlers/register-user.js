const { registerUser } = require('users-logic')
const { handleError } = require('./helpers')

module.exports = async (req, res) => {
    const { body: { name, username, email, password } } = req 

    try {
        await registerUser(name, username, email, password)
        
        res.status(201).send()
    } catch (error) {
        handleError(error, res)
    }
}