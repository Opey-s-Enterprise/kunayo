const express = require('express');
const  path = require('path');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

const routes = require('./routes/router');

app.use('/',routes);

app.listen(port, () => {
    console.log('server is running')
});

// const express = require('express');
// const app = express();

// const PORT = 3000;

// const indexRoute = require('./routes/index');
// const loginRoute =require('./routes/login');

// app.use(express.static('public'));

// app.use('/', indexRoute);
// app.use('/login', loginRoute);

// // app.get('/', (req, res) => {
// //         //res.send("Hello")
// //  	res.sendFile(__dirname + '/../public/index.html');
// // });

// // app.get('/products', (req, res) => {
// //         res.sendFile(__dirname + '/views/product/product-list.html');
// // });

// // app.get('/login', (req, res) => {
// //         res.sendFile(__dirname + '/views/user/login.html');
// // });

// // app.get('/db', (req, res) => {
// //         res.sendFile(__dirname + '/server/config/databaseInfo.js');
// //});

// //app.get('/', (req, res) => {
// //        res.sendFile(__dirname + '/public/index.html');
// //});

// app.listen(PORT, () => {
//         console.log("server running")
// });