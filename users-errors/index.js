const createErrorType = require('./create-error-type')

module.exports = {
    CredentialsError: createErrorType('CredentialsError'),
    NotFoundError: createErrorType('NotFoundError'),
    ConflictError: createErrorType('ConflictError'),
    FormatError: createErrorType('FormatError')
}