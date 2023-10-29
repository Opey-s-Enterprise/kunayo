const express =require('express'),
    router = express.Router(),
    path = require('path'),
    projectRoot = path.resolve(__dirname, '..', '..'),
    db = require('./db.js'),
    bcrypt = require('bcryptjs'),
    loggedIn = require('../controllers/loggedIn'),
    logout = require('../controllers/logOut'),
    Product =require('../models/products.js'),
    dotenv = require('dotenv').config();

//..../user/
router.get('/login',(req,res) => {
    res.render('user/login');
});
router.get('/logout', logout)
router.get('/signup', (req,res) => {
    res.render('user/signup');
});
router.get('/myAccount', loggedIn, (req,res) => {
if (req.user){  
    res.render('user/myAccount',{status:'loggedIn', user:req.user })
}else{
    res.render('user/myAccount',{status:'no', user:'nothing' })
}
})
 

//.../product/
router.get('/', (req,res) => {
    db.query('select * from products', (err, result) => {
    res.render('product/product_page', {result:result, pagetitle: 'New_Arrivals', pageDescription: 'New_Arrivals'})
    // Product.getAll((products) => {
    // res.render('product/new_arrival', {productSection: products})
});
}); 
router.get('/accessories', (req,res) => {
    db.query('select * from products', (err, result) => {
        res.render('product/product_page', {result:result, pagetitle: 'Accessories', pageDescription: 'Accessories'})
    });
});
router.get('/new_arrival', (req,res) => {
    db.query('select * from products', (err, result) => {
        res.render('product/product_page', {result:result, pagetitle: 'New_Arrivals', pageDescription: 'New Arrivals'})
    });
}); 
router.get('/pants', (req,res) => {
    db.query(`select * from products where type ='pants'`, (err, result) => {
        res.render('product/product_page', {result:result, pagetitle: 'Pants', pageDescription: 'Pants'})
    });
});
router.get('/shop_all', (req,res) => {
    db.query('select * from products', (err, result) => {
        res.render('product/product_page', {result:result, pagetitle: 'Shop_all', pageDescription: 'Shop All'})
    });
});
router.get('/T-shirts', (req,res) => {
    db.query(`select * from products where type ='T-shirts'`, (err, result) => {
        res.render('product/product_page', {result:result, pagetitle: 'T-shirts', pageDescription: 'T-shirts'})
    });
});
router.get('/outerwear', (req,res) => {
    db.query(`select * from products where type ='outwear'`, (err, result) => {
        res.render('product/product_page', {result:result, pagetitle: 'Outerwear', pageDescription: 'Outerwear'})
    });
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
router.get('/delivery', (req,res) => {
    res.render('pages/delivery')
});


//...../cart-logic
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
router.get('/cart', loggedIn, (req,res) => {
    if (!req.session) {
        res.status(500).send('Session is not properly initialized');
        return;
    }
         if (req.user){        
            var cart = req.session.cart,
                total = req.session.total;
            res.render('pages/cart', {cart:cart, total:total, status:'loggedIn', user:req.user})     
        }else{        
            var cart = req.session.cart,
                total = req.session.total;
                
            res.render('pages/cart', {cart:cart, total:total, status:'no', user:'nothing'})
        }
    
    
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


//...../Checkout Page
router.get('/checkout',loggedIn, (req, res) => {
    if (req.user){  
            const total = req.session.total
            const publicKey =process.env.paystackPublicKey
        res.render('pages/checkout',{total:total,publicKey:publicKey, status:'loggedIn', user:req.user })
    }else{
        const total = req.session.total
            const publicKey =process.env.paystackPublicKey
        res.render('pages/checkout',{total:total,publicKey:publicKey, status:'no', user:'nothing' })
    }
});
    //...../payment
// Endpoint to check payment status
router.post('/check-payment/', async (req, res) => {
    const reference = req.body.reference;
    console.log(`new payment initiated ref is: ${reference}`);
        try {
            const axios = require('axios');
            const paystackSecretKey = process.env.paystackSecretKey;

            const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
                headers: {
                    Authorization: `Bearer ${paystackSecretKey}`,
                },
            });
                if (response.data.data.status === 'success' && response.data.data.amount === (req.session.total *100)) {
                    const transactionReference = response.data.data.reference;
                    res.json({status: 'Y', transactionReference });
                    console.log(`ref: ${reference} is verified`)
                } 
                else {
                    res.json({status: 'N'});
                    console.log(`FRAUD: ${reference} verfication failed...status:${response.data.data.status} Paid amount:${response.data.data.amount} === Amount expected:${req.session.total*100}`)
                    const checkout_data = {
                        name: req.body.name,
                        email: req.body.email,
                        city: req.body.city,
                        phone: req.body.phone,
                        address: req.body.address,
                        cost: req.session.total,
                        date: new Date(),
                        cart: req.session.cart
                    };
                    console.log(checkout_data);
                }
        }catch (error) {
            console.error(error);
            console.log(error)
            res.status(500).send('Failed to check payment status');
            res.json({status: 'internal'})
        }
});
//..../adding orderr to db and sending mail
router.post('/place_order', (req, res) => {
    try {
        const checkout_data = {
            name: req.body.name,
            email: req.body.email,
            city: req.body.city,
            phone: req.body.phone,
            address: req.body.address,
            cost: req.session.total,
            status: 'VERIFIED',
            date: new Date(),
            cart: req.session.cart
        };
        console.log(checkout_data);
    } catch (error) {
        console.log('could not register order data on database')                    
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
    //             console.log('Customer Data sucessufully added to Database')
    //         })
    //     }
    // })    
});

router.get('/sendMail', (req,res) => {
    res.render('pages/payment')
})
router.post('/sendMail', (req, res)=>{
    const nodemailer = require('nodemailer')
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.myEmail,
            pass:process.env.myEmailPass,
        }
    })
    const mailOptions = {
        from: process.env.myEmail,
        to: 'akereabdulraheem@gmail.com',
        subject: 'Linux Node Mailer test',
        text:'Sent from Node.js app 3' 
    }

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
            res.status(500).json('Error sending email');
        } else {
            console.log('Email sent');
            res.json('Email sent successfully');
        }
    })
})
//the end

module.exports =router;