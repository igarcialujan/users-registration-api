const jwt = require('jsonwebtoken')
const { env: { SECRET } } = process

function validateAuthorizationAndExtractPayload(authorization) {
    if (typeof authorization !== 'string') throw new TypeError('authorization is not a string')
    
    const [, token] = authorization.split(' ')

    const payload = jwt.verify(token, SECRET)

    return payload
}

module.exports = validateAuthorizationAndExtractPayload