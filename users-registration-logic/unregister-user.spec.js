require('dotenv').config()
const { expect } = require('chai')
const unregisterUser = require('./unregister-user')
const { mongoose, models: { User } } = require('users-registration-data')
const { Types: { ObjectId } } = mongoose
const { CredentialsError, FormatError } = require('users-registration-errors')
const bcrypt = require('bcryptjs')

const { env: { MONGO_TESTS_URI } } = process

describe('unregisterUser', () => {
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

    it('should suceed with existing id and correct password', async () => {
        let { password } = user 
        
        const res = await unregisterUser(userId, password)

        expect(res).to.be.undefined
    
        const user2 = await User.findById(userId)   

        expect(user2).to.be.null
    })

    it('should fail with non-existing id', async () => { 
        const { password } = user

        const userId = ObjectId().toString()

        try {
            await unregisterUser(userId, password)
            
            throw new Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.instanceOf(CredentialsError)
            expect(error.message).to.equal('wrong credentials')
        }
    })

    it('should fail with incorrect password', async () => {
        let { password } = user

        password += '-wrong'

        try {
            await unregisterUser(userId, password)
            
            throw new Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.instanceOf(CredentialsError)
            expect(error.message).to.equal('wrong credentials')
        }
    })
    

    describe('when parameters are not valid', () => {
        describe('when id is not valid', () => {
            it('should fail when id is not a string', () => {
                expect(() => unregisterUser(true, '123123123')).to.throw(TypeError, 'id is not a string')

                expect(() => unregisterUser(123, '123123123')).to.throw(TypeError, 'id is not a string')

                expect(() => unregisterUser({}, '123123123')).to.throw(TypeError, 'id is not a string')

                expect(() => unregisterUser(() => { }, '123123123')).to.throw(TypeError, 'id is not a string')

                expect(() => unregisterUser([], '123123123')).to.throw(TypeError, 'id is not a string')
            })

            it('should fail when id is empty or blank', () => {
                expect(() => unregisterUser('', '123123123')).to.throw(Error, 'id is empty or blank')

                expect(() => unregisterUser('   ', '123123123')).to.throw(Error, 'id is empty or blank')
            })

            it('should fail when id has spaces', () => {
                expect(() => unregisterUser(' abcd1234abcd1234abcd1234 ', '123123123')).to.throw(Error, 'id has blank spaces')

                expect(() => unregisterUser('abcd 1234abc d1234abc d1234', '123123123')).to.throw(Error, 'id has blank spaces')
            })
        })

        describe('when password is not valid', () => {
            it('should fail when password is not a string', () => {
                expect(() => unregisterUser('abcd1234abcd1234abcd1234', true)).to.throw(TypeError, 'password is not a string')

                expect(() => unregisterUser('abcd1234abcd1234abcd1234', 123)).to.throw(TypeError, 'password is not a string')

                expect(() => unregisterUser('abcd1234abcd1234abcd1234', {})).to.throw(TypeError, 'password is not a string')

                expect(() => unregisterUser('abcd1234abcd1234abcd1234', () => { })).to.throw(TypeError, 'password is not a string')

                expect(() => unregisterUser('abcd1234abcd1234abcd1234', [])).to.throw(TypeError, 'password is not a string')
            })

            it('should fail when password is empty', () => {
                expect(() => unregisterUser('abcd1234abcd1234abcd1234', '')).to.throw(FormatError, 'password is empty or blank')

                expect(() => unregisterUser('abcd1234abcd1234abcd1234', '   ')).to.throw(FormatError, 'password is empty or blank')
            })

            it('should fail when password has spaces', () => {
                expect(() => unregisterUser('abcd1234abcd1234abcd1234', ' 123123123 ')).to.throw(FormatError, 'password has blank spaces')

                expect(() => unregisterUser('abcd1234abcd1234abcd1234', '123 123 123')).to.throw(FormatError, 'password has blank spaces')
            })

            it('should fail when password length is less that 8 characters', () => {
                expect(() => unregisterUser('abcd1234abcd1234abcd1234', '123123')).to.throw(FormatError, 'password has less than 8 characters')
            })
        })
    })

    after(async () => {
        await User.deleteMany()

        await mongoose.disconnect()
    })
})