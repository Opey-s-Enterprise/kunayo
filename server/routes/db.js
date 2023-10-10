const mysql = require('mysql2');
const dotenv = require('dotenv').config();
const db = mysql.createConnection({
    host: process.env.HOST_DB,
    user: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    database: process.env.DB,
});
module.exports=db;