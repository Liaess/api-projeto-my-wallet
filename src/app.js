import express from "express";
import cors from "cors";
import * as userController from "./controllers/userController.js";

const app = express();
app.use(cors());
app.use(express.json());

app.post('/signup', userController.signup);
app.post('/signin', userController.signin);
app.post('/logout', userController.logout);
app.post('/revenue', userController.addRevenue);
app.post('/expense', userController.addExpense);
app.get('/wallet', userController.getWallet);

export default app;