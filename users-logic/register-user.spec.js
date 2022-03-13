require('dotenv').config()
const { expect } = require('chai')
const registerUser = require('./register-user')
const { mongoose, models: { User } } = require('users-data')
const { ConflictError, FormatError } = require('users-errors')
const bcrypt = require('bcryptjs')

const { env: { MONGO_URI } } = process

describe('registerUser', () => {
    before(() => mongoose.connect(MONGO_URI))

    beforeEach(() => User.deleteMany())

    it('should suceed with new user', async () => {
        const name = 'Wendy Pan'
        const username = 'wendy'
        const email = 'wendypan@gmail.com'
        const password = '123123123'

        const res = await registerUser(name, username, email, password)
            
        expect(res).to.be.undefined

        const user = await User.findOne({ email })
     
        expect(user).to.exist
        expect(user.email).to.equal(email)
        expect(bcrypt.compareSync(password, user.password)).to.be.true      
    })

    describe('when user already exists', () => {
        let user 

        beforeEach(() => {
            user = {
                name: 'Wendy Pan',
                username: 'wendy',
                email: 'wendypan@gmail.com',
                password: '123123123'
            }

            return User.create(user) 
        })

        it('should fail when user already exists', async () => {
            const { name, username, email, password } = user

            try {
                await registerUser(name, username, email, password)

                throw new Error('should not reach this point')

            } catch(error) {
                expect(error).to.exist
                expect(error).to.be.instanceOf(ConflictError) 
                expect(error.message).to.equal('user with this username or email already exists')
            }
        })
    })

    describe('when parameters are not valid', () => {
        describe('when name is not valid', () => {
            it('should fail when name is not valid', () => {
                expect(() => registerUser(true, 'wendy', 'wendypan@gmail.com', '123123123')).to.throw(TypeError, 'name is not a string')

                expect(() => registerUser(123, 'wendy', 'wendypan@gmail.com', '123123123')).to.throw(TypeError, 'name is not a string')

                expect(() => registerUser({}, 'wendy', 'wendypan@gmail.com', '123123123')).to.throw(TypeError, 'name is not a string')

                expect(() => registerUser(() => {}, 'wendy', 'wendypan@gmail.com', '123123123')).to.throw(TypeError, 'name is not a string')

                expect(() => registerUser([], 'wendy', 'wendypan@gmail.com', '123123123')).to.throw(TypeError, 'name is not a string')
            })

            it('should fail when name is empty', () => {
                expect(() => registerUser('', 'wendy', 'wendypan@gmail.com', '123123123')).to.throw(FormatError, 'name is empty or blank')

                expect(() => registerUser('   ', 'wendy', 'wendypan@gmail.com', '123123123')).to.throw(FormatError, 'name is empty or blank')
            })

            it('should fail when name has spaces around', () => {
                expect(() => registerUser(' Wendy Pan ', 'wendy', 'wendypan@gmail.com', '123123123')).to.throw(FormatError, 'blank spaces around name')
            })
        })

        describe('when username is not valid', () => {
            it('should fail when username is not valid', () => {
                expect(() => registerUser('Wendy Pan', true, 'wendypan@gmail.com', '123123123')).to.throw(TypeError, 'username is not a string')

                expect(() => registerUser('Wendy Pan', 123, 'wendypan@gmail.com', '123123123')).to.throw(TypeError, 'username is not a string')

                expect(() => registerUser('Wendy Pan', {}, 'wendypan@gmail.com', '123123123')).to.throw(TypeError, 'username is not a string')

                expect(() => registerUser('Wendy Pan', () => {}, 'wendypan@gmail.com', '123123123')).to.throw(TypeError, 'username is not a string')

                expect(() => registerUser('Wendy Pan', [], 'wendypan@gmail.com', '123123123')).to.throw(TypeError, 'username is not a string')
            })

            it('should fail when username is empty', () => {
                expect(() => registerUser('Wendy Pan', '', 'wendypan@gmail.com', '123123123')).to.throw(FormatError, 'username is empty or blank')

                expect(() => registerUser('Wendy Pan', '   ', 'wendypan@gmail.com', '123123123')).to.throw(FormatError, 'username is empty or blank')
            })

            it('should fail when username has spaces', () => {
                expect(() => registerUser('Wendy Pan', 'wen dy', 'wendypan@gmail.com', '123123123')).to.throw(FormatError, 'username has blank spaces')

                expect(() => registerUser('Wendy Pan', ' wendy ', 'wendypan@gmail.com', '123123123')).to.throw(FormatError, 'username has blank spaces')
            })

            it('should fail when username length is less than 4 characters', () => {
                expect(() => registerUser('Wendy Pan', 'wen', 'wendypan@gmail.com', '123123123')).to.throw(FormatError, 'username has less than 4 characters')
            })
        })

        describe('when email is not valid', () => {
            it('should fail when email is not valid', () => {
                expect(() => registerUser('Wendy Pan', 'wendy', true, '123123123')).to.throw(TypeError, 'email is not a string')

                expect(() => registerUser('Wendy Pan', 'wendy', 123, '123123123')).to.throw(TypeError, 'email is not a string')

                expect(() => registerUser('Wendy Pan', 'wendy', {}, '123123123')).to.throw(TypeError, 'email is not a string')

                expect(() => registerUser('Wendy Pan', 'wendy', () => {}, '123123123')).to.throw(TypeError, 'email is not a string')

                expect(() => registerUser('Wendy Pan', 'wendy', [], '123123123')).to.throw(TypeError, 'email is not a string')
            })

            it('should fail when email is empty', () => {
                expect(() => registerUser('Wendy Pan', 'wendy', '', '123123123')).to.throw(FormatError, 'email is empty or blank')

                expect(() => registerUser('Wendy Pan', 'wendy', '   ', '123123123')).to.throw(FormatError, 'email is empty or blank')
            })

            it('should fail when email has spaces', () => {
                expect(() => registerUser('Wendy Pan', 'wendy', ' wendypan@gmail.com ', '123123123')).to.throw(FormatError, 'email has blank spaces')

                expect(() => registerUser('Wendy Pan', 'wendy', 'wendy pan@gmail.com', '123123123')).to.throw(FormatError, 'email has blank spaces')
            })
        })

        describe('when password is not valid', () => {
            it('should fail when password is not a string', () => {
                expect(() => registerUser('Wendy Pan', 'wendypan', 'wendypan@gmail.com', true)).to.throw(TypeError, 'password is not a string')

                expect(() => registerUser('Wendy Pan', 'wendypan', 'wendypan@gmail.com', 123)).to.throw(TypeError, 'password is not a string')

                expect(() => registerUser('Wendy Pan', 'wendypan', 'wendypan@gmail.com', {})).to.throw(TypeError, 'password is not a string')

                expect(() => registerUser('Wendy Pan', 'wendypan', 'wendypan@gmail.com', () => {})).to.throw(TypeError, 'password is not a string')

                expect(() => registerUser('Wendy Pan', 'wendypan', 'wendypan@gmail.com', [])).to.throw(TypeError, 'password is not a string')
            })

            it('should fail when password is empty', () => {
                expect(() => registerUser('Wendy Pan', 'wendypan', 'wendypan@gmail.com', '')).to.throw(FormatError, 'password is empty or blank')

                expect(() => registerUser('Wendy Pan', 'wendypan', 'wendypan@gmail.com', '   ')).to.throw(FormatError, 'password is empty or blank')
            })

            it('should fail when password has spaces', () => {
                expect(() => registerUser('Wendy Pan', 'wendypan', 'wendypan@gmail.com', ' 123123123 ')).to.throw(FormatError, 'password has blank spaces')

                expect(() => registerUser('Wendy Pan', 'wendypan', 'wendypan@gmail.com', '123 123 123')).to.throw(FormatError, 'password has blank spaces')
            })

            it('should fail when password length is less than 8 characters', () => {
                expect(() => registerUser('Wendy Pan', 'wendypan', 'wendypan@gmail.com', '123123')).to.throw(FormatError, 'password has less than 8 characters')
            })
        })
    })
    
    after(async () => {
        await User.deleteMany()
        
        await mongoose.disconnect()
    })
})