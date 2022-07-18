const request = require('supertest')('https://users-registration-api.herokuapp.com/api');
const { expect } = require("chai");

describe("POST /users", () => {
    const user = {
        name: 'Wendy Pan',
        username: 'testusersregistrationapi',
        email: 'wendypan@testusersregistrationapi.org',
        password: '123123123'
    }

    it("should suceed with new user", async () => {
        const response = await request
            .post("/users")
            .send(user)
    
        expect(response.status).to.eql(201)
    })

    it("should fail when username already exits", async () => {
        const response = await request
            .post("/users")
            .send({
                name: 'Wendy Pan',
                username: 'testusersregistrationapi',
                email: 'wendypan@gmail.com',
                password: '123123123'
            })
    
        expect(response.status).to.eql(409)
    })

    it("should fail when email already exits", async () => {
        const response = await request
            .post("/users")
            .send({
                name: 'Wendy Pan',
                username: 'wendypantestapi',
                email: 'wendypan@testusersregistrationapi.org',
                password: '123123123'
            })
    
        expect(response.status).to.eql(409)
    })
})

describe("POST /users/auth", () => {
    it("should suceed with correct username and password", async () => {
        const response = await request
            .post("/users/auth")
            .send({
                username: 'testusersregistrationapi',
                password: '123123123'
            })
    
        expect(response.status).to.eql(200)
        expect(response.body.token).to.be.a('string')
    })

    it("should fail with wrong username", async () => {
        const response = await request
            .post("/users/auth")
            .send({
                username: 'testwrongusername',
                password: '123123123'
            })
    
        expect(response.status).to.eql(401)
    })

    it("should fail with wrong password", async () => {
        const response = await request
            .post("/users/auth")
            .send({
                username: 'testusersregistrationapi',
                password: '234234234'
            })
    
        expect(response.status).to.eql(401)
    })
})

describe("GET /users", () => {
    it("should suceed with correct token", async () => {
        const authentication = await request
            .post("/users/auth")
            .send({
                username: 'testusersregistrationapi',
                password: '123123123'
            })

        const response = await request
            .get("/users")
            .set("Authorization", `Bearer token=${authentication.token}`)
            .send({
                username: 'testusersregistrationapi',
                password: '123123123'
            })
    
        expect(response.status).to.eql(200)
        expect(response.body.token).to.be.a('string')
    })

    it("should fail with wrong username", async () => {
        const response = await request
            .get("/users")
            .send({
                username: 'testwrongusername',
                password: '123123123'
            })
    
        expect(response.status).to.eql(401)
    })

    it("should fail with wrong password", async () => {
        const response = await request
            .get("/users")
            .send({
                username: 'testusersregistrationapi',
                password: '234234234'
            })
    
        expect(response.status).to.eql(401)
    })
})