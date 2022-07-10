require('dotenv').config()
const { expect } = require('chai')
const authenticateUser = require('./authenticate-user')
const { mongoose, models: { User } } = require('users-registration-data')
const { CredentialsError, FormatError } = require('users-registration-errors')
const bcrypt = require('bcryptjs')

const { env: { MONGO_TESTS_URI } } = process

describe('authenticateUser', () => {
    before(() => mongoose.connect(MONGO_TESTS_URI))

    beforeEach(() => User.deleteMany())
    
    let user, userId

    beforeEach(async () => {
        user = {
            name: 'Wendy Pan',
            username: 'wendypan',
            email: 'wendypan@gmail.com',
            password: '123123123'
        }

        const user2 = await User.create({ ...user, password: bcrypt.hashSync(user.password) })
        
        userId = user2.id
    })

    it('should suceed with correct credentials for an already existing user', async () => {
        const { username, password } = user 

        const id = await authenticateUser(username, password)

        expect(id).to.exist
        expect(id).to.equal(userId)
    })

    it('should fail with incorrect password', async () => {
        const { username, password } = user

        try {
            await authenticateUser(username, password + '-wrong')
            
            throw new Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.instanceOf(CredentialsError)
            expect(error.message).to.equal('wrong credentials')
        }
    })

    it('should fail with incorrect username', async () => {
        const { username, password } = user

        try {
            await authenticateUser(username + '-wrong', password)
            
            throw new Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.instanceOf(CredentialsError)
            expect(error.message).to.equal('wrong credentials')
        }
    })

    it('should fail with incorrect password', async () => {
        const { username, password } = user

        try {
            await authenticateUser(username, password + '-wrong')
            
            throw new Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.instanceOf(CredentialsError)
            expect(error.message).to.equal('wrong credentials')
        }
    })

    describe('when parameters are not valid', () => {
        describe('when username is not valid', () => {
            it('should fail when username is not a string', () => {
                expect(() => authenticateUser(true, '123123123')).to.throw(TypeError, 'username is not a string')

                expect(() => authenticateUser(123, '123123123')).to.throw(TypeError, 'username is not a string')

                expect(() => authenticateUser({}, '123123123')).to.throw(TypeError, 'username is not a string')

                expect(() => authenticateUser(() => {}, '123123123')).to.throw(TypeError, 'username is not a string')

                expect(() => authenticateUser([], '123123123')).to.throw(TypeError, 'username is not a string')
            })

            it('should fail when username is empty', () => {
                expect(() => authenticateUser('', '123123123')).to.throw(FormatError, 'username is empty or blank')

                expect(() => authenticateUser('   ', '123123123')).to.throw(FormatError, 'username is empty or blank')
            })

            it('should fail when username has spaces', () => {
                expect(() => authenticateUser(' wendypan ', '123123123')).to.throw(FormatError, 'username has blank spaces')

                expect(() => authenticateUser('wendy pan', '123123123')).to.throw(FormatError, 'username has blank spaces')
            })

            it('should fail when username length is less that 4 characters', () => {
                expect(() => authenticateUser('wp', '123123123')).to.throw(FormatError, 'username has less than 4 characters')
            })
        })

        describe('when password is not valid', () => {
            it('should fail when password is not a string', () => {
                expect(() => authenticateUser('wendypan', true)).to.throw(TypeError, 'password is not a string')

                expect(() => authenticateUser('wendypan', 123)).to.throw(TypeError, 'password is not a string')

                expect(() => authenticateUser('wendypan', {})).to.throw(TypeError, 'password is not a string')

                expect(() => authenticateUser('wendypan', () => {})).to.throw(TypeError, 'password is not a string')

                expect(() => authenticateUser('wendypan', [])).to.throw(TypeError, 'password is not a string')
            })

            it('should fail when password is empty', () => {
                expect(() => authenticateUser('wendypan', '')).to.throw(FormatError, 'password is empty or blank')

                expect(() => authenticateUser('wendypan', '   ')).to.throw(FormatError, 'password is empty or blank')
            })

            it('should fail when password has spaces', () => {
                expect(() => authenticateUser('wendypan', ' 123123123 ')).to.throw(FormatError, 'password has blank spaces')

                expect(() => authenticateUser('wendypan', '123 123 123')).to.throw(FormatError, 'password has blank spaces')
            })

            it('should fail when password length is less that 8 characters', () => {
                expect(() => authenticateUser('wendypan', '123123')).to.throw(FormatError, 'password has less than 8 characters')
            })
        })
    })

    after(async () => {
        await User.deleteMany()

        await mongoose.disconnect()
    })      
})