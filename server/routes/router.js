const express =require('express'),
    router = express.Router(),
    path = require('path'),
    projectRoot = path.resolve(__dirname, '..', '..'),
    db = require('./db.js'),
    bcrypt = require('bcryptjs'),
    loggedIn = require('../controllers/loggedIn'),
    Product =require('../models/products.js'),
    dotenv = require('dotenv').config();

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
        if (cart[i].sale_price){
            total = total + (cart[i].sale_price * cart[i].quantity);
        }else{
            total = total + (cart[i].price * cart[i].quantity);
        }
    }
    req.session.total = total;
    return total;
}
router.post('/add-to-cart', (req, res) => {
    const
        productId = req.body.product_id,
        productName = req.body.product_name,
        productPrice = parseFloat(req.body.product_price),
        productImage = req.body.product_image,
        productQuantity =req.body.quantity,
        productSalePrice = req.body.sale_price
        product = {
            id:productId, name: productName, price: productPrice, quantity:productQuantity, image: productImage, sale_price:productSalePrice
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

    res.redirect(req.get('Referer'));

});

router.get('/cart', (req,res) => {
    if (!req.session) {
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
    const total = req.session.total
    const publicKey =process.env.paystackPublicKey
  res.render('pages/checkout',{total:total,publicKey:publicKey })
});

router.post('/place_order', (req, res) => {
    try {
        const checkout_data = {
            name: req.body.name,
            email: req.body.email,
            city: req.body.city,
            phone: req.body.phone,
            address: req.body.address,
            cost: req.session.total,
            status: 'PAID',
            date: new Date(),
            cart: req.session.cart
        };
        console.log(checkout_data);
    } catch (error) {
        console.log('could not register order data')                    
    }

    // let product_ids = '';  
    // for(let i=0; i<cart.length; i++){
    //     product_ids = product_ids + ',' + cart[i].id;
    // }

    // db.connect((err) => {
    //     if (err){
    //         console.log(err)
    //     }else{
    //         const query = "INSERT INTO orders(cost,name,email,status,city,address,phone,date,product_ids) VALUES ?";
    //         const values =[
    //                 [cost,name,email,status,city,address,phone,date,product_ids]
    //             ];
                
    //          db.query(query,[values],(err,result)=>{
    //             const paystackResponse = req.session.paystackResponse
    //             res.json({ reference, paystackResponse});
    //             res.status(500).send('Payment process completed!');
    //         })
    //     }
    // })    
});

//payment / Thank you
// Endpoint to check payment status
router.post('/check-payment/', async (req, res) => {
    const reference = req.body.reference;
    console.log(`new payment ref is: ${reference}`);
    try {
        const axios = require('axios');
        const paystackSecretKey = process.env.paystackSecretKey;

        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${paystackSecretKey}`,
            },
        });
        if (response.data.data.status === 'success') {
            const transactionReference = response.data.data.reference;
            res.json({ transactionReference });

        } else {
            res.json("Payment verification failed");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to check payment status');
    }
});
//the end

module.exports =router;