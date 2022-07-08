const { FormatError } = require('../../users-registration-errors')

function validateId(id) {
    if (typeof id !== 'string') throw new TypeError('id is not a string')
    if (!id.trim().length) throw new FormatError('id is empty or blank')
    if (/\r?\n|\r|\t| /g.test(id)) throw new FormatError('id has blank spaces')
    if (id.length !== 24) throw new FormatError('id does not have 24 characters')
}

function validateName(name) {
    if (typeof name !== 'string') throw new TypeError('name is not a string')
    if (!name.trim().length) throw new FormatError('name is empty or blank')
    if (name.trim() !== name) throw new FormatError('blank spaces around name')
}

function validateUsername(username) {
    if (typeof username !== 'string') throw new TypeError('username is not a string')
    if (!username.trim().length) throw new FormatError('username is empty or blank')
    if (/\r?\n|\r|\t| /g.test(username)) throw new FormatError('username has blank spaces')
    if (username.length < 4) throw new FormatError('username has less than 4 characters')
}

function validateEmail(email) {
    if (typeof email !== 'string') throw new TypeError('email is not a string')
    if (!email.trim().length) throw new FormatError('email is empty or blank')
    if (/\r?\n|\r|\t| /g.test(email)) throw new FormatError('email has blank spaces')
    if (!String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) throw new FormatError('email does not have a valid email format')
}

function validatePassword(password) {
    if (typeof password !== 'string') throw new TypeError('password is not a string')
    if (!password.trim().length) throw new FormatError('password is empty or blank')
    if (/\r?\n|\r|\t| /g.test(password)) throw new FormatError('password has blank spaces')
    if (password.length < 8) throw new FormatError('password has less than 8 characters')
}

function validateNewPassword(newPassword) {
    if (typeof newPassword !== 'string') throw new TypeError('new password is not a string')
    if (!newPassword.trim().length) throw new FormatError('new password is empty or blank')
    if (/\r?\n|\r|\t| /g.test(newPassword)) throw new FormatError('new password has blank spaces')
    if (newPassword.length < 8) throw new FormatError('new password has less than 8 characters')
}

function validateToken(token) {
    if (typeof token !== 'string') throw new TypeError(`${token} is not a string`)
    if (!/[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)$/.test(token)) throw new Error('invalid token')
}

function validateData(data) {
    if (typeof data !== 'object' || data.constructor.name !== 'Object') throw new TypeError('data is not an object')

    const { newName, newUsername, newEmail, password, newPassword, favs } = data

    if (favs !== undefined) {
        validateArray(favs)
    } else if (newName || newUsername || newEmail || newPassword) {
        validatePassword(password)

        if (newName && newName !== '')
            validateName(newName)
    
        if (newUsername && newUsername !== '')
            validateUsername(newUsername)
    
        if (newEmail && newEmail !== '')
            validateEmail(newEmail)
    
        if (newPassword && newPassword !== '')
            validateNewPassword(newPassword)
    } else {
        throw Error('no user data has changed')
    }
}

function validateArray(array) {
    if (!(array instanceof Array)) throw new TypeError(`${array} is not an array`)
}

module.exports = {
    validateId,
    validateName,
    validateUsername,
    validateEmail,
    validatePassword,
    validateNewPassword,
    validateToken,
    validateData
}