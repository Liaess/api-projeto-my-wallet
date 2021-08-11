import connection from "../database.js";

export async function checkEmail(email) {
    return await connection.query(`SELECT * FROM users WHERE email = $1`,[email]);
}

export async function createUser(name, email, hash) {
    await connection.query(`INSERT INTO users (name, email, password) VALUES ($1, $2, $3)`, [name, email, hash]);
}

export async function createSession(token, id){
    await connection.query(`INSERT INTO sessions (token, user_id) VALUES ($1, $2)`,[token, id]);
}

export async function checkToken(token){
    return await connection.query(`SELECT user_id as id FROM sessions WHERE token = $1`, [token]);
}

export async function logoutUser(token) {
    await connection.query(`DELETE FROM sessions WHERE token = $1`, [token]);
}

export async function createReveneu(name, id, description, value, date){
    await connection.query(`INSERT INTO register (name, user_id, type, description, value, date) VALUES ($1, $2, $3, $4, $5, $6)`,[name, id, "Revenue", description, value, date]);
}

export async function createExpense(name, id, description, value, date) {
    await connection.query(`INSERT INTO register (name, user_id, type, description, value, date) VALUES ($1, $2, $3, $4, $5, $6)`,[name, id, "Expense", description, value, date]);
}

export async function registerFromUser(id) {
    return await connection.query(`SELECT * FROM register where user_id = $1`, [id]);
}