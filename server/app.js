const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const cookie = require('cookie-parser');
const routes = require('./routes/router');
// const db = require('./routes/db');
app.set('view engine', 'ejs');
app.set('views', (path.join(__dirname,'..', 'views')));
app.use(express.static(path.join(__dirname, '..', 'public')));
//app.use('/public', express.static(path.join(__dirname, 'public')));
//app.use('/css', express.static(path.join(__dirname,'..', '..', 'public', 'css' )));
app.use(express.json());
app.use('/',routes);
// db.connect((err) => {
//     if (err) throw err;
//     console.log('Connected to database');
// });
app.listen(port, () => {
    console.log('server is running');
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
    const formattedTime = `${currentDate.getHours()}-${currentDate.getMinutes()}-${currentDate.getSeconds()}`;
    console.log(`Date: ${formattedDate}, Time: ${formattedTime}`)
});