const express =require('express'),
    router = express.Router(),
    path = require('path'),
    projectRoot = path.resolve(__dirname, '..', '..'),
    db = require('./db.js'),
    bcrypt = require('bcryptjs'),
    loggedIn = require('../controllers/loggedIn'),
    Product =require('../models/products.js');

//..../user/
router.get('/',(req,res) => {
    res.render('user/login');
});
router.get('/signup', (req,res) => {
    res.render('user/signup');
});


//.../product/
router.get('/accessories', (req,res) => {
    res.render('product/Accessories')
});
router.get('/new_arrival', (req,res) => {
    const mysql = require('mysql2'),dotenv = require('dotenv').config(),
        db = mysql.createConnection({
        host: process.env.HOST_DB,
        user: process.env.USER_DB,
        password: process.env.PASSWORD_DB,
        database: process.env.DB,
    })
        db.query('select * from products', (err, result) => {
        res.render('product/new_arrival', {result:result})
    // Product.getAll((products) => {
    // res.render('product/new_arrival', {productSection: products})
    });
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


//..../pages
router.get('/faq', (req,res) => {
    res.render('pages/FAQs')
});
router.get('/about', (req,res) => {
    res.render('pages/About')
});
router.get('/checkout', (req,res) => {
    res.render('pages/checkout')
});
router.get('/contact_us', (req,res) => {
    res.render('pages/contact-us')
});
router.get('/t&c', (req,res) => {
    res.render('pages/T&C')
});

//cart-logic
function isProductInCart(cart, productId){
    for(let i=0; i<cart.length; i++){
        if(cart[i].id == productId){
            return true;
        }
    }
    return false;
}
function calculateTotal(cart, req){
    total = 0;
    for (let i =0; i<cart.length; i++){
        if (cart[i].price){
            total = total + (cart[i].price * cart[i].quantity);
        }
    }
    req.session.total = total;
    return total;
}
router.post('/add-to-cart', (req, res) => {
    const productId = req.body.product_id,
        productName = req.body.product_name,
        productPrice = parseFloat(req.body.product_price),
        productImage = req.body.product_image,
        productQuantity =req.body.quantity,
        product = {
            id:productId, name: productName, price: productPrice, quantity:productQuantity, image: productImage 
        };

    // Check if a cart already exists in the session
    if(req.session.cart) {
        const cart = req.session.cart;

        if(!isProductInCart(cart, productId)){
            cart.push(product);
        }
    }else{
        req.session.cart = [];
        const cart = req.session.cart;
    }
    const cart = req.session.cart;
    calculateTotal(cart,req);

    const redirectTo = req.get('referer')
        res.redirect(redirectTo);
});

router.get('/cart', (req,res) => {
    if (!req.session) {
        // Handle the case where the session is not properly initialized
        res.status(500).send('Session is not properly initialized');
        return;
    }
    var cart = req.session.cart,
        total = req.session.total;
        
    res.render('pages/cart', {cart:cart, total:total})
});

router.post('/remove_product', (req, res) => {
    const id = req.body.id,
        cart = req.session.cart;

        for (let i=0; i<cart.length; i++){
            if(cart[i].id == id){
                cart.splice(cart.indexOf(i),1)
            }
        }
        calculateTotal(cart,req);
        res.redirect('/cart');
})

router.post('/edit_product_quantity', (req,res) =>{
    const id =req.body.id,
        quantity = req.body.quantity,
        increase_btn = req.body.increaseProductQuantity,
        decrease_btn = req.body.decreaseProductQuantity,
        cart = req.session.cart;

        if(increase_btn){
            for(let i=0; i<cart.length; i++){
                if (cart[i].id == id){
                    if(cart[i].quantity > 0){
                        cart[i].quantity = parseInt(cart[i].quantity)+1;
                    }
                }
            }
        }

        if(decrease_btn){
            for(let i=0; i<cart.length; i++){
                if (cart[i].id == id){
                    if(cart[i].quantity > 1 ){
                        cart[i].quantity = parseInt(cart[i].quantity)-1;
                    }
                }
            }
        }

        calculateTotal(cart, req);
        res.redirect('/cart');
})


// Checkout Page
router.get('/checkout', (req, res) => {
  res.render('pages/checkout')
});

router.post('/place_order', (req, res) => {
    res.render('pages/checkout')
});


module.exports =router;

// router.get('/', (req,res) => {
//     res.render('index')
// });

//res.sendFile(path.join(projectRoot, 'views', 'user', 'login.html'));


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