const express =require('express');
const router = express.Router();
const path = require('path');
const projectRoot = path.resolve(__dirname, '..', '..');

router.get('/', (req,res) => {
    res.render('index')
});

//..../user/
router.get('/login', (req,res) => {
    res.render('user/login');
    //res.sendFile(path.join(projectRoot, 'views', 'user', 'login.html'));
});
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

module.exports =router;