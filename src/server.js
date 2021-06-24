import express from "express";
import cors from "cors";
import pg from "pg";
import bcrypt from "bcrypt";
import Joi from "joi";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";

const server = express();
server.use(cors());
server.use(express.json());
const { Pool } = pg;
const connection = new Pool({
    "host": "localhost",
    "port": 5432,
    "database": "mywallet",
    "user": "postgres",
    "password": "123456"
});

server.post('/signup', async (req,res)=>{
    const { name, email, password } = req.body;
    const hash = bcrypt.hashSync(password, 10);
    const schema = Joi.object({
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] }}).required(),
    });
    const value = schema.validate({email:email});
    if(value.error) return res.status(400).send("Este email não é válido!");
    const checkEmail = await connection.query(`
        SELECT * FROM users
        WHERE email = $1
    `,[email]);
    if(checkEmail.rows.length !== 0) return res.status(409).send("Email já está em uso!");
    try{
        await connection.query(`INSERT INTO users (name, email, password) VALUES ($1, $2, $3)`, [name, email, hash]);
        res.sendStatus(201);
    }catch(e){
        console.log(e)
        res.sendStatus(500);
    }
});

server.post('/signin', async (req,res)=>{
    const { email, password } = req.body;
    try{
        const result = await connection.query(`SELECT * FROM users WHERE email = $1`,[email]);
        if(!result.rows[0]) return res.sendStatus(401);
        if(result.rows[0] && bcrypt.compareSync(password, result.rows[0].password)){
            const token = uuidv4();
            await connection.query(`INSERT INTO sessions (token, user_id) VALUES ($1, $2)`,[token, result.rows[0].id]);
            res.send({
                user: result.rows[0].name,
                token,
            })
        } else return res.sendStatus(401);
    }catch(e){
        console.log(e)
        res.sendStatus(500);
    }
});

server.post('/logout', async (req,res)=>{
    const Authorization = req.header('Authorization');
    const token = Authorization?.replace("Bearer ", "");
    if(!token) return res.sendStatus(401);
    try{
        await connection.query(`DELETE FROM sessions WHERE token = $1`, [token]);
        res.sendStatus(200);
    }catch(e){
        console.log(e)
        res.sendStatus(500);
    }
});

server.post('/reveneu', async (req,res)=>{
    let { name, value, description } = req.body;
    value = parseInt(value) * 100;
    const authorization = req.header('Authorization');
    const token = authorization?.replace("Bearer ", "");
    if(!token) return res.sendStatus(401);
    const date = format(new Date(), 'd/MM');
    try{
        const getUserId = await connection.query(`SELECT user_id as id FROM sessions WHERE token = $1`, [token]);
        const id = getUserId.rows[0].id;
        await connection.query(`INSERT INTO register (name, user_id, type, description, value, date) VALUES ($1, $2, $3, $4, $5, $6)`,[name, id, "Reveneu", description, value, date]);
        res.sendStatus(201);
    } catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});

server.post('/expense', async (req,res)=>{
    let { name, value, description } = req.body;
    value = parseInt(value) * 100;
    const authorization = req.header('Authorization');
    const token = authorization?.replace("Bearer ", "");
    if(!token) return res.sendStatus(401);
    const date = format(new Date(), 'd/MM');
    try{
        const getUserId = await connection.query(`SELECT user_id as id FROM sessions WHERE token = $1`, [token]);
        const id = getUserId.rows[0].id;
        await connection.query(`INSERT INTO register (name, user_id, type, description, value, date) VALUES ($1, $2, $3, $4, $5, $6)`,[name, id, "Expense", description, value, date]);
        res.sendStatus(201);
    } catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});

server.get('/wallet', async (req,res)=>{
    const authorization = req.header('Authorization');
    const token = authorization?.replace("Bearer ", "");
    if(!token) return res.sendStatus(401);
    try{
        const getUserId = await connection.query(`SELECT user_id as id FROM sessions WHERE token = $1`, [token]);
        const id = getUserId.rows[0].id;
        const result = await connection.query(`SELECT * FROM register where user_id = $1`, [id]);
        const transactions = result.rows;
        let total = 0;
        transactions.forEach((each) => {
            each.type === "Reveneu" ? (total += each.value) : (total -= each.value);
        });
        console.log(total);
        res.send({transactions, total});
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});

server.listen(4000, ()=>{
    console.log("Server running on port 4000!");
});