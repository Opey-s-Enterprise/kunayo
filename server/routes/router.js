const express =require('express');
const router = express.Router();
const path = require('path');
const projectRoot = path.resolve(__dirname, '..', '..');
const db = require('./db.js');
const bcrypt = require('bcryptjs');

// router.get('/', (req,res) => {
//     res.render('index')
// });

//..../user/
//....................login......................
router.get('/', (req,res) => {
    res.render('user/login');
    //res.sendFile(path.join(projectRoot, 'views', 'user', 'login.html'));
});
// router.post('/', (req, res) => {
//         const { username, password} = req.body;

//         db.query('select * from users_Info where username =?', [username], (err, results) => {
//             if (err) throw err;
//             if (results.length === 1){
                
//                 const user = results[0];
//                 bcrypt.compare(pasword, user.password, (bcryptErr, bcryptResult) => {
//                     if (bcryptErr) throw bcryptErr;
//                     if (bcryptResult) {
//                         req.session.userId = user.id;
//                         res.redirect('/new_arrival');
//                     } else {
//                         res.redirect('/login?error=1');
//                     }
//                 });
//             }else {
//                 res.json({status: "error", error: "username has not been registered. please signup"});
//                 res.redirect('/signup');
//             };
//         });
// });
        
            
router.get('/signup', (req,res) => {
    res.render('user/signup');
});

//.../product/
router.get('/accessories', (req,res) => {
    res.render('product/Accessories')
});
router.get('/new_arrival', (req,res) => {
    res.render('product/new_arrival')
});
router.get('/pants', (req,res) => {
    res.render('product/pants')
});
router.get('/shop_all', (req,res) => {
    res.render('product/shop_all')
});
router.get('/T-shirts', (req,res) => {
    res.render('product/T-shirts')
});
router.get('/outerwear', (req,res) => {
    res.render('product/outerwear')
});


router.get('/faq', (req,res) => {
    res.render('pages/FAQs')
});

module.exports =router;