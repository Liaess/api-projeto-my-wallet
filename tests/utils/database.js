import connection from "../../src/database.js";

export async function clearDatabase() {
    await connection.query(`TRUNCATE TABLE users RESTART IDENTITY`);
    await connection.query(`TRUNCATE TABLE sessions RESTART IDENTITY`);
    await connection.query(`TRUNCATE TABLE register RESTART IDENTITY`);
}

export async function closeConnection() {
    await connection.end();
}