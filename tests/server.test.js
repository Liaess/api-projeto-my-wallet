import app from '../src/app.js';
import supertest from 'supertest';
import connection from '../src/database.js';

beforeEach(async () =>{
    await connection.query(`DELETE FROM users`);
    await connection.query(`DELETE FROM sessions`);
    await connection.query(`DELETE FROM register`);
})

describe("POST /signup", () => {
    it("returns status 400 for schema email", async ()=>{
        const body = {
            name: "Test verify",
            email: "test.verify@gmail",
            password: "123456"
        }
        const result = await supertest(app).post("/signup").send(body);
        expect(result.status).toEqual(400);
    });

    it("returns status 409 for valid conflic email", async ()=>{
        const body = {
            name: "Test verify",
            email: "test.verify@gmail.com",
            password: "123456"
        }
        const resultCreate = await supertest(app).post("/signup").send(body);
        expect(resultCreate.status).toEqual(201);
        const result = await supertest(app).post("/signup").send(body);
        expect(result.status).toEqual(409);
    });
});

describe("POST /signin", () => {
    it("returns status 406 for not registered", async ()=>{
        const body = {
            name: "Test verify",
            email: "test2.verify@gmail.com",
            password: "123456"
        }
        const result = await supertest(app).post("/signin").send(body);
        expect(result.status).toEqual(406);
    });

    it("returns status 406 for valid conflic email", async ()=>{
        const body = {
            name: "Test verify",
            email: "test2.verify@gmail.com",
            password: "123456"
        }
        const result = await supertest(app).post("/signin").send(body);
        expect(result.status).toEqual(406);
    });
});