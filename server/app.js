const express = require('express'),
    path = require('path'),
    app = express(),
    port = 3000,
    cookie = require('cookie-parser'),
    bodyParser = require('body-parser'),
    routes = require('./routes/router'),
    db = require('./routes/db'),
    session = require('express-session');


app.set('view engine', 'ejs');
app.set('views', (path.join(__dirname,'..', 'views')));

app.use(session({secret:process.env.SESSION_KEY, resave: false, saveUninitialized: true,}))
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());
app.use(cookie());
app.use((err, req, res, next) => {
    console.error(err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ error: 'Internal Server Error' });
});
app.use('/api', require('./controllers/auth'));
app.use('/',routes);


db.connect((err) => {
    if (err) throw err;
    console.log(`Connected to database`);
});
app.listen(port, () => {
    console.log(`server is running on ${port}`);
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
    const formattedTime = `${currentDate.getHours()}-${currentDate.getMinutes()}-${currentDate.getSeconds()}`;
    console.log(`Date: ${formattedDate}, Time: ${formattedTime}`)
});
