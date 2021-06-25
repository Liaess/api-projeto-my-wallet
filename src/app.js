import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import Joi from "joi";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";
import connection from "./database.js";

const app = express();
app.use(cors());
app.use(express.json());

app.post('/signup', async (req,res)=>{
    const { name, email, password } = req.body;
    const hash = bcrypt.hashSync(password, 10);
    const schema = Joi.object({
        name: Joi.string().min(1).required(),
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
        password: Joi.string().alphanum().pattern(/[a-zA-Z0-9]/).min(4).required()
    })
    const value = schema.validate({name:name, email:email, password:password,});
    if(value.error) return res.sendStatus(400);
    const checkEmail = await connection.query(`
        SELECT * FROM users
        WHERE email = $1
    `,[email]);
    if(checkEmail.rows.length !== 0) return res.sendStatus(409);
    try{
        await connection.query(`INSERT INTO users (name, email, password) VALUES ($1, $2, $3)`, [name, email, hash]);
        res.sendStatus(201);
    }catch(e){
        console.log(e)
        res.sendStatus(500);
    }
});

app.post('/signin', async (req,res)=>{
    const { email, password } = req.body;
    const schema = Joi.object({
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
        password: Joi.string().alphanum().pattern(/[a-zA-Z0-9]/).min(4).required()
    })
    const value = schema.validate({email:email, password:password,});
    if(value.error) return res.sendStatus(400);    
    try{
        const result = await connection.query(`SELECT * FROM users WHERE email = $1`,[email]);
        if(!result.rows[0]) return res.sendStatus(406);
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

app.post('/logout', async (req,res)=>{
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

app.post('/revenue', async (req,res)=>{
    let { name, value, description } = req.body;
    const authorization = req.header('Authorization');
    const token = authorization?.replace("Bearer ", "");
    const schema = Joi.object({
        value: Joi.number().min(1).required()
    });
    const valueValidated = schema.validate({value:value});
    if(valueValidated.error) return res.sendStatus(400);
    if(!token) return res.sendStatus(401);
    const date = format(new Date(), 'd/MM');
    if(value.includes(".")){
        value = value.replace(".","");
        value = parseInt(value);
    } else {
        value = parseInt(value) * 100;
    }
    try{
        const getUserId = await connection.query(`SELECT user_id as id FROM sessions WHERE token = $1`, [token]);
        const id = getUserId.rows[0].id;
        await connection.query(`INSERT INTO register (name, user_id, type, description, value, date) VALUES ($1, $2, $3, $4, $5, $6)`,[name, id, "Revenue", description, value, date]);
        res.sendStatus(201);
    } catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});

app.post('/expense', async (req,res)=>{
    let { name, value, description } = req.body;
    const authorization = req.header('Authorization');
    const token = authorization?.replace("Bearer ", "");
    const schema = Joi.object({
        value: Joi.number().min(1).required()
    });
    const valueValidated = schema.validate({value:value});
    if(valueValidated.error) return res.sendStatus(400);
    if(!token) return res.sendStatus(401);
    const date = format(new Date(), 'd/MM');
    if(value.includes(".")){
        value = value.replace(".","");
        value = parseInt(value);
    } else {
        value = parseInt(value) * 100;
    }
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

app.get('/wallet', async (req,res)=>{
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
            each.type === "Revenue" ? (total += each.value) : (total -= each.value);
        });
        res.send({transactions, total});
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});

export default app;