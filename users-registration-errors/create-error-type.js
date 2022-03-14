function createErrorType(name) {
    return class extends Error {
        constructor(message) {
            super(message)

            this.name = name
        }
    }
}

module.exports = createErrorType