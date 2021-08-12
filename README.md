# My Wallet API

An easy to use financial manager. Track your revenues and expenses to learn how you spend your money and know all the time how much you have.

## About

This is an API for a web application with which lots of people can manage their own expenses and revenues. Below are the implemented features:

- [x] Sign Up
- [x] Login
- [x] List all financial events for a user
- [x] Add expense
- [x] Add revenue

The following tools and frameworks were used in the construction of the project:<br>

<img src="https://img.shields.io/badge/-NodeJS-&?style=for-the-badge&logo=nodedotjs&color=black" alt="Node logo" /> <img src="https://img.shields.io/badge/-Jest-&?style=for-the-badge&logo=jest&color=black" alt="Jest logo" /> <img src="https://img.shields.io/badge/-PostgreSQL-&?style=for-the-badge&logo=postgresql&color=black" alt="Postgres logo" /> <img src="https://img.shields.io/badge/-Express-&?style=for-the-badge&logo=express&color=black" alt="Express logo" />

## How to run

1. Clone this repository
```bash
git clone https://github.com/Liaess/my-wallet-api
```
2. Clone the front-end repository at https://github.com/Liaess/my-wallet
3. Follow instructions to run front-end at https://github.com/Liaess/my-wallet
4. Create a Database using the ``dump.sql`` file inside the ``database`` folder by following these steps:
    - 4.1 Open your terminal **Important: the terminal must be opened in the same path as the ``dump.sql`` file is located.**
    - 4.2 Access PostgreSQL using the command ``sudo su postgres`` and enter your password when prompted
    - 4.3 Next, type ``psql postgres`` and hit enter
    - 4.4 Create a database by typing ``CREATE DATABASE mywallet;`` and hitting enter
    - 4.5 Type ``\q`` and hit enter
    - 4.6 Finally, type ```psql mywallet < dump.sql``` and hit enter. Your database should be ready after this step
5. Set the environment variables by following these steps:
    - 5.1 Create a ``.env`` file in the folder root
    - 5.2 Copy the content of the ``.env.example`` into it
    - 5.3 Set the ``DATABASE_URL`` in this format: "postgres://user:password@host:port/mywallet"
    - 5.4 Set the ``PORT`` for 4000
6. In your terminal, go back to the root folder and install the dependencies
```bash
npm i
```
7. Also in the root folder, run the back-end with
```bash
npm run dev
```
8. Your server should be running now