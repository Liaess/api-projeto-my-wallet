import { checkEmail, createUser, createSession, checkToken, createExpense, createReveneu, registerFromUser } from "../repositories/userRepository.js"
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";

export async function attemptToCreate(name, email, password) {
    const result = await checkEmail(email)
    if(result.rows.length !== 0) return null
    const hash = bcrypt.hashSync(password, 10);
    await createUser(name, email, hash)
}

export async function attemptToLogin(email, password){
    const result = await checkEmail(email);
    if(!result.rows[0]) return 406
    if(result.rows[0] && bcrypt.compareSync(password, result.rows[0].password)){
        const token = uuidv4();
        await createSession(token, result.rows[0].id);
        return ({user: result.rows[0].name,token})
    } else return (null);
}

export async function attemptToReveneu(name, value, description, token){
    if(value.includes(".")){
        value = value.replace(".","");
        value = parseInt(value);
    } else {
        value = parseInt(value) * 100;
    }
    const getUserId = await checkToken(token);
    const date = format(new Date(), 'd/MM');
    const id = getUserId.rows[0].id;
    await createReveneu(name, id, description, value, date);
}

export async function attemptToExpense(name, value, description, token) {
    console.log(token)
    if(value.includes(".")){
        value = value.replace(".","");
        value = parseInt(value);
    } else {
        value = parseInt(value) * 100;
    }
    const getUserId = await checkToken(token);
    if(!getUserId) return 400;
    const date = format(new Date(), 'd/MM');
    const id = getUserId.rows[0].id;
    await createExpense(name, id, description, value, date);
}

export async function attemptToGetWallet(token){
    const getUserId = await checkToken(token);
    if(!getUserId) return 400;
    const id = getUserId.rows[0].id;
    const result = await registerFromUser(id);
    const transactions = result.rows;
    let total = 0;
    transactions.forEach((each) => {
        each.type === "Revenue" ? (total += each.value) : (total -= each.value);
    });
    return({transactions, total});
}