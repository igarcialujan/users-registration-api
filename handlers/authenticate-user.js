const { authenticateUser } = require('users-registration-logic')
const jwt = require('jsonwebtoken')
const { env: { SECRET } } = process
const { handleError } = require('./helpers')

module.exports = async (req, res) => {
    const { body: { username, password } } = req 

    try { 
        const id = await authenticateUser(username, password)

        const token = jwt.sign({ sub: id, exp: Math.floor(Date.now() / 1000) + 36000 }, SECRET)

        res.json({ token })
    } catch(error) {
        handleError(error, res)
    }
}