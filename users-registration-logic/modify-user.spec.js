require('dotenv').config()
const { expect } = require('chai')
const modifyUser = require('./modify-user')
const { mongoose, models: { User } } = require('users-registration-data')
const { Types: { ObjectId } } = mongoose
const { CredentialsError, FormatError, ConflictError, NotFoundError } = require('users-registration-errors')
const bcrypt = require('bcryptjs')

const { env: { MONGO_TESTS_URI } } = process

describe('modifyUser', () => {
    before(() => mongoose.connect(MONGO_TESTS_URI))

    beforeEach(() => User.deleteMany())
 
    let user, userId

    beforeEach(async () => {
        user = {
            name: 'Wendy Pan',
            username: 'wendypan',
            email: 'wendypan@gmail.com',
            password: '123123123',
            favs: []
        }

        const user2 = await User.create({ ...user, password: bcrypt.hashSync(user.password) })
        
        userId = user2.id
    })

    it('should succeed with existing id and correct password', async () => {
        let { name, username, password } = user 

        const newName = name + '-updated'
        const newUsername = username + '-updated'
        const newEmail = 'wendy.pan@gmail.com'
        const newPassword = password + '-updated'

        const data = { newName, newUsername, newEmail, password, newPassword }

        const res = await modifyUser(userId, data)

        expect(res).to.be.undefined
    
        const user2 = await User.findById(userId)   

        expect(user2.name).to.equal(newName)
        expect(user2.username).to.equal(newUsername)
        expect(user2.email).to.equal(newEmail)
        expect(bcrypt.compareSync(newPassword, user2.password)).to.be.true
    })

    it('should succeed with existing id and correct favs', async () => {
        const favs = ['12345XFD']

        const data = { favs }

        const res = await modifyUser(userId, data)

        expect(res).to.be.undefined
    
        const user2 = await User.findById(userId)   

        expect(user2.favs[0]).to.equal(favs[0])
    })

    it('should fail with non-existing id', async () => {
        const { username, password } = user

        const userId = ObjectId().toString()
        const newUsername = username + '-updated'

        try {
            await modifyUser(userId, { newUsername, password })
            
            throw new Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.instanceOf(NotFoundError)
            expect(error.message).to.equal(`user with id ${userId} not found`)
        }
    })

    it('should fail with incorrect password', async () => {
        let { username, password } = user

        password += '-wrong'
        const newUsername = username + '-updated'

        const data = { newUsername, password }

        try {
            await modifyUser(userId, data)
            
            throw new Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.instanceOf(CredentialsError)
            expect(error.message).to.equal('wrong password')
        }
    })

    it('should fail when trying to update the username to another that already exists', async () => {
        const user2 = {
            name: 'Peter Pan',
            username: 'peterpan',
            email: 'peterpan@gmail.com',
            password: '123123123'
        }

        const newUsername = 'peterpan'
        
        const { password } = user

        try {
            await User.create(user2)
                
            await modifyUser(userId, { newUsername, password })
            
            throw new Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.instanceOf(ConflictError)
            expect(error.message).to.equal('user with that username or email already exists')
        }
    })
    

    describe('when parameters are not valid', () => {
        describe('when id is not valid', () => {
            it('should fail when id is not a string', () => {
                expect(() => modifyUser(true, { })).to.throw(TypeError, 'id is not a string')

                expect(() => modifyUser(123, { })).to.throw(TypeError, 'id is not a string')

                expect(() => modifyUser({}, { })).to.throw(TypeError, 'id is not a string')

                expect(() => modifyUser(() => {}, { })).to.throw(TypeError, 'id is not a string')

                expect(() => modifyUser([], { })).to.throw(TypeError, 'id is not a string')
            })

            it('should fail when id is empty or blank', () => {
                expect(() => modifyUser('', { })).to.throw(Error, 'id is empty or blank')

                expect(() => modifyUser('   ', { })).to.throw(Error, 'id is empty or blank')
            })

            it('should fail when id has spaces', () => {
                expect(() => modifyUser(' abcd1234abcd1234abcd1234 ', { })).to.throw(Error, 'id has blank spaces')

                expect(() => modifyUser('abcd 1234abc d1234abc d1234', { })).to.throw(Error, 'id has blank spaces')
            })
        })

        describe('when data is not valid', () => {
            it('should fail when data is not an object', () => {
                expect(() => modifyUser('abcd1234abcd1234abcd1234', true)).to.throw(TypeError, 'data is not an object')

                expect(() => modifyUser('abcd1234abcd1234abcd1234', 123)).to.throw(TypeError, 'data is not an object')

                expect(() => modifyUser('abcd1234abcd1234abcd1234', '')).to.throw(TypeError, 'data is not an object')

                expect(() => modifyUser('abcd1234abcd1234abcd1234', () => {})).to.throw(TypeError, 'data is not an object')

                expect(() => modifyUser('abcd1234abcd1234abcd1234', [])).to.throw(TypeError, 'data is not an object')
            })
        })

        describe('when properties in data are not valid', () => {
            describe('when new name is not valid', () => {
                it('should fail when new name is not a string', () => {
                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123123123', newName: true })).to.throw(TypeError, 'name is not a string')

                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123123123', newName: 123 })).to.throw(TypeError, 'name is not a string')

                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123123123', newName: {} })).to.throw(TypeError, 'name is not a string')

                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123123123', newName: () => {} })).to.throw(TypeError, 'name is not a string')

                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123123123', newName: [] })).to.throw(TypeError, 'name is not a string')
                })

                it('should fail when new name is blank', () => {
                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123123123', newName: '   ' })).to.throw(FormatError, 'name is empty or blank')
                })

                it('should fail when new name has spaces around', () => {
                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123123123', newName: ' Wendy Pan ' })).to.throw(FormatError, 'blank spaces around name')
                })
            })

            describe('when new username is not valid', () => {
                it('should fail when new username is not a string', () => {
                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123123123', newUsername: true })).to.throw(TypeError, 'username is not a string')

                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123123123', newUsername: 123 })).to.throw(TypeError, 'username is not a string')

                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123123123', newUsername: {} })).to.throw(TypeError, 'username is not a string')

                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123123123', newUsername: () => {} })).to.throw(TypeError, 'username is not a string')

                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123123123', newUsername: [] })).to.throw(TypeError, 'username is not a string')
                })

                it('should fail when new username is blank', () => {
                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123123123', newUsername: '   ' })).to.throw(FormatError, 'username is empty or blank')
                })

                it('should fail when new username has spaces', () => {
                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123123123', newUsername: ' wendypan ' })).to.throw(FormatError, 'username has blank spaces')

                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123123123', newUsername: 'wendy pan' })).to.throw(FormatError, 'username has blank spaces')
                })

                it('should fail when new username length is less that 4 characters', () => {
                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123123123', newUsername: 'wp' })).to.throw(FormatError, 'username has less than 4 characters')
                })
            })

            describe('when new email is not valid', () => {
                it('should fail when new email is not a string', () => {
                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123123123', newEmail: true })).to.throw(TypeError, 'email is not a string')

                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123123123', newEmail: 123 })).to.throw(TypeError, 'email is not a string')

                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123123123', newEmail: {} })).to.throw(TypeError, 'email is not a string')

                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123123123', newEmail: () => {} })).to.throw(TypeError, 'email is not a string')

                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123123123', newEmail: [] })).to.throw(TypeError, 'email is not a string')
                })

                it('should fail when new email is blank', () => {
                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123123123', newEmail: '   ' })).to.throw(FormatError, 'email is empty or blank')
                })

                it('should fail when new email has spaces', () => {
                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123123123', newEmail: ' wendypan@gmail.com ' })).to.throw(FormatError, 'email has blank spaces')

                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123123123', newEmail: 'wendy pan@gmail.com' })).to.throw(FormatError, 'email has blank spaces')
                })

                it('should fail when new email does not have a valid email format', () => {
                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123123123', newEmail: 'wp@gmail..com' })).to.throw(FormatError, 'email does not have a valid email format')
                })
            })

            describe('when password is not valid', () => {
                it('should fail when password is not a string', () => {
                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: true, newPassword: 234234234 })).to.throw(TypeError, 'password is not a string')

                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: 123, newPassword: 234234234 })).to.throw(TypeError, 'password is not a string')

                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: {}, newPassword: 234234234 })).to.throw(TypeError, 'password is not a string')

                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: () => {}, newPassword: 234234234 })).to.throw(TypeError, 'password is not a string')

                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: [], newPassword: 234234234 })).to.throw(TypeError, 'password is not a string')
                })

                it('should fail when password is empty', () => {
                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '', newPassword: 234234234 })).to.throw(FormatError, 'password is empty or blank')

                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '   ', newPassword: 234234234 })).to.throw(FormatError, 'password is empty or blank')
                })

                it('should fail when password has spaces', () => {
                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: ' 123123123 ', newPassword: 234234234 })).to.throw(FormatError, 'password has blank spaces')

                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123 123 123', newPassword: 234234234 })).to.throw(FormatError, 'password has blank spaces')
                })

                it('should fail when password length is less that 8 characters', () => {
                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123123', newPassword: 234234234 })).to.throw(FormatError, 'password has less than 8 characters')
                })
            })

            describe('when new password is not valid', () => {
                it('should fail when new password is not a string', () => {
                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123123123', newPassword: true })).to.throw(TypeError, 'new password is not a string')

                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123123123', newPassword: 123 })).to.throw(TypeError, 'new password is not a string')

                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123123123', newPassword: {} })).to.throw(TypeError, 'new password is not a string')

                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123123123', newPassword: () => {} })).to.throw(TypeError, 'new password is not a string')

                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123123123', newPassword: [] })).to.throw(TypeError, 'new password is not a string')
                })

                it('should fail when new password is blank', () => {
                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123123123', newPassword: '   ' })).to.throw(FormatError, 'new password is empty or blank')
                })

                it('should fail when new password has spaces', () => {
                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123123123', newPassword: ' 123123123 ' })).to.throw(FormatError, 'new password has blank spaces')

                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123123123', newPassword: '123 123 123' })).to.throw(FormatError, 'new password has blank spaces')
                })

                it('should fail when new password length is less that 8 characters', () => {
                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { password: '123123123', newPassword: '123123' })).to.throw(FormatError, 'new password has less than 8 characters')
                })
            })

            describe('when favs is not valid', () => {
                it('should fail when favs is not an array', () => {
                    let favs
                    favs = true
                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { favs })).to.throw(TypeError, `${favs} is not an array`)

                    favs = 123
                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { favs })).to.throw(TypeError, `${favs} is not an array`)

                    favs = {}
                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { favs })).to.throw(TypeError, `${favs} is not an array`)

                    favs = () => {}
                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { favs })).to.throw(TypeError, `${favs} is not an array`)

                    favs = ''
                    expect(() => modifyUser('abcd1234abcd1234abcd1234', { favs })).to.throw(TypeError, `${favs} is not an array`)
                })
            })
        })
    })

    after(async () => {
        await User.deleteMany()

        await mongoose.disconnect()
    })
})