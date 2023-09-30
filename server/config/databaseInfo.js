const mysql = require('mysql');
const db = mysql.createconnect({
    host:'localhost',
    user:'abdulraheem',
    password:'',
    database:'test',
});

module.exports = db;