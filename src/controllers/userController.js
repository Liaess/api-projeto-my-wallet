import { signupSchema, signinschema, valueSchema } from "../schemas/userSchemas.js";
import { attemptToCreate, attemptToLogin, attemptToReveneu, attemptToExpense, attemptToGetWallet } from "../services/userService.js";
import { logoutUser } from "../repositories/userRepository.js";

export async function signup(req, res) {
    const { name, email, password } = req.body;
    const value = signupSchema.validate({name:name, email:email, password:password,});
    if(value.error) return res.sendStatus(400);
    try{
        const result = await attemptToCreate(name, email, password);
        if(result === null) return res.sendStatus(409);
        res.sendStatus(201);
    }catch(e){
        console.log(e)
        res.sendStatus(500);
    }
}

export async function signin(req, res) {
    const { email, password } = req.body;
    const value = signinschema.validate({email:email, password:password,});
    if(value.error) return res.sendStatus(400);    
    try{
        const result = await attemptToLogin(email, password);
        if(result === 406) return res.sendStatus(406);
        if(result === null) return res.sendStatus(401);
        res.send(result)
    }catch(e){
        console.log(e)
        res.sendStatus(500);
    }
}

export async function logout(req, res){
    const Authorization = req.header('Authorization');
    const token = Authorization?.replace("Bearer ", "");
    if(!token) return res.sendStatus(401);
    try{
        await logoutUser(token)
        res.sendStatus(200);
    }catch(e){
        console.log(e)
        res.sendStatus(500);
    }
}

export async function addRevenue(req, res){
    const { name, value, description } = req.body;
    const authorization = req.header('Authorization');
    const token = authorization?.replace("Bearer ", "");
    const checkValueSchema = valueSchema.validate({value:value});
    if(checkValueSchema.error) return res.sendStatus(400);
    if(!token) return res.sendStatus(401);
    try{
        const result = await attemptToReveneu(name, value, description, token);
        if(result === 400) return res.sendStatus(400);
        res.sendStatus(201);
    } catch(e){
        console.log(e);
        res.sendStatus(500);
    }
}

export async function addExpense(req,res) {
    const { name, value, description } = req.body;
    const authorization = req.header('Authorization');
    const token = authorization?.replace("Bearer ", "");
    const valueValidated = valueSchema.validate({value:value});
    if(valueValidated.error) return res.sendStatus(400);
    if(!token) return res.sendStatus(401);
    try{
    const result = await attemptToExpense(name, value, description, token);
    if(result === 400) return res.sendStatus(400);
    res.sendStatus(201);
    } catch(e){
        console.log(e);
        res.sendStatus(500);
    }
}

export async function getWallet(req,res){
    const authorization = req.header('Authorization');
    const token = authorization?.replace("Bearer ", "");
    if(!token) return res.sendStatus(401);
    try{
        const result = await attemptToGetWallet(token)
        if(result === 400) return res.sendStatus(400);
        res.send({transactions: result.transactions, total:result.total})
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
}