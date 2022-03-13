require('dotenv').config()
const { expect } = require('chai')
const retrieveUser = require('./retrieve-user')
const { mongoose, models: { User } } = require('users-data')
const { Types: { ObjectId } } = mongoose  
const { NotFoundError, FormatError } = require('users-errors')

const { env: { MONGO_URI } } = process

describe('retrieveUser', () => {
    before(() => mongoose.connect(MONGO_URI))

    beforeEach(() => User.deleteMany())

    let user, userId 

    beforeEach(async () => {
        user = {
            name: 'Wendy Pan',
            username: 'wendypan',
            email: 'wendypan@gmail.com',
            password: '123123123'
        }

        const user2 = await User.create(user)
        
        userId = user2.id
    })

    it('should suceed with correct id for an already existing user', async () => { 
        const { name, username, email } = user 

        const user2 = await retrieveUser(userId)
            
        expect(user2).to.exist
        expect(user2.name).to.equal(name)
        expect(user2.username).to.equal(username)
        expect(user2.email).to.equal(email)
        expect(user2.password).to.not.exist
    })

    it('should fail with incorrect id', async () => {
        userId = new ObjectId().toString()

        try {
            await retrieveUser(userId)
            
            throw new Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.instanceOf(NotFoundError)
            expect(error.message).to.equal(`user with id ${userId} not found`)
        }
    })

    describe('when parameters are not valid', () => {
        describe('when id is not valid', () => {
            it('should fail when id is not a string', () => {
                expect(() => retrieveUser(true)).to.throw(TypeError, 'id is not a string')

                expect(() => retrieveUser(123)).to.throw(TypeError, 'id is not a string')

                expect(() => retrieveUser({})).to.throw(TypeError, 'id is not a string')

                expect(() => retrieveUser(() => {})).to.throw(TypeError, 'id is not a string')

                expect(() => retrieveUser([])).to.throw(TypeError, 'id is not a string')
            })

            it('should fail when id is empty or blank', () => {
                expect(() => retrieveUser('')).to.throw(FormatError, 'id is empty or blank')

                expect(() => retrieveUser('   ')).to.throw(FormatError, 'id is empty or blank')
            })

            it('should fail when id has spaces', () => {
                expect(() => retrieveUser(' abcd1234abcd1234abcd1234 ')).to.throw(FormatError, 'id has blank spaces')

                expect(() => retrieveUser('abcd 1234abc d1234abc d1234')).to.throw(FormatError, 'id has blank spaces')
            })

            it('should fail when id length is different from 24 characters', () => {
                expect(() => retrieveUser('abc')).to.throw(FormatError, 'id does not have 24 characters')
            })
        })
    })

    after(async () => {
        await User.deleteMany()
        
        await mongoose.disconnect()
    })
})