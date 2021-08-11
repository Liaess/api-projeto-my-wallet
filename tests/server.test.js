import app from '../src/app.js';
import supertest from 'supertest';
import connection from '../src/database.js';
import database from '../src/database.js';

beforeEach(async () =>{
    await connection.query(`TRUNCATE TABLE users RESTART IDENTITY`);
    await connection.query(`TRUNCATE TABLE sessions RESTART IDENTITY`);
    await connection.query(`TRUNCATE TABLE register RESTART IDENTITY`);
})

afterAll(async ()=>{
    await connection.query(`TRUNCATE TABLE users RESTART IDENTITY`);
    await connection.query(`TRUNCATE TABLE sessions RESTART IDENTITY`);
    await connection.query(`TRUNCATE TABLE register RESTART IDENTITY`);
    database.end();
});

describe("POST /signup", () => {
    it("returns status 201 for schema email", async ()=>{
        const body = {
            name: "Test verify",
            email: "test.verify@gmail.com",
            password: "123456"
        }
        const result = await supertest(app).post("/signup").send(body);
        expect(result.status).toEqual(201);
    });

    it("returns status 400 for schema email", async ()=>{
        const body = {
            name: "Test verify",
            email: "test.verify@gmail",
            password: "123456"
        }
        const result = await supertest(app).post("/signup").send(body);
        expect(result.status).toEqual(400);
    });

    it("returns status 400 for schema name", async ()=>{
        const body = {
            name: "",
            email: "test.verify@gmail",
            password: "123456"
        }
        const result = await supertest(app).post("/signup").send(body);
        expect(result.status).toEqual(400);
    });

    it("returns status 400 for schema password", async ()=>{
        const body = {
            name: "Test verify",
            email: "test.verify@gmail",
            password: "123"
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
    it("returns status 400 for schema email", async ()=>{
        const bodyCreate = {
            name: "Test verify",
            email: "test.verify@gmail.com",
            password: "123456"
        }
        const body = {
            email: "asdasdasd",
            password: "123456"
        }
        const resultCreate = await supertest(app).post("/signup").send(bodyCreate);
        expect(resultCreate.status).toEqual(201);
        const result = await supertest(app).post("/signin").send(body);
        expect(result.status).toEqual(400);
    });

    it("returns status 400 for schema password", async ()=>{
        const bodyCreate = {
            name: "Test verify",
            email: "test.verify@gmail.com",
            password: "123456"
        }
        const body = {
            email: "test.verify@gmail.com",
            password: "123"
        }
        const resultCreate = await supertest(app).post("/signup").send(bodyCreate);
        expect(resultCreate.status).toEqual(201);
        const result = await supertest(app).post("/signin").send(body);
        expect(result.status).toEqual(400);
    });

    it("returns status 200 for sucess on login", async ()=>{
        const bodyCreate = {
            name: "Test verify",
            email: "test2.verify@gmail.com",
            password: "123456"
        }
        const bodyLogin = {
            name: "Test verify",
            email: "test2.verify@gmail.com",
            password: "123456"
        }
        const resultCreate = await supertest(app).post("/signup").send(bodyCreate);
        expect(resultCreate.status).toEqual(201);
        const result = await supertest(app).post("/signin").send(bodyLogin);
        expect(result.status).toEqual(200);
    });

    it("returns status 406 for not registered", async ()=>{
        const body = {
            name: "Test verify",
            email: "test2.verify@gmail.com",
            password: "123456"
        }
        const result = await supertest(app).post("/signin").send(body);
        expect(result.status).toEqual(406);
    });

    it("returns status 401 for password conflict", async ()=>{
        const bodyCreate = {
            name: "Test verify",
            email: "test2.verify@gmail.com",
            password: "123456"
        }
        const bodyLogin = {
            name: "Test verify",
            email: "test2.verify@gmail.com",
            password: "1234567"
        }
        const resultCreate = await supertest(app).post("/signup").send(bodyCreate);
        expect(resultCreate.status).toEqual(201);
        const result = await supertest(app).post("/signin").send(bodyLogin);
        expect(result.status).toEqual(401);
    });
});