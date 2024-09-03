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
router.get('/myAccount', loggedIn, (req, res) => {
    if (!req.user || !req.user.id) {
        res.render('user/myAccount', { status: 'error', error: 'You must be logged in to access this page.' });
    }

    const userId = req.user.id;
    console.log('User:', req.user);
    console.log('User ID:', userId);


    const query = `
      SELECT orders.id, orders.cost, DATE_FORMAT(orders.date, '%Y-%m-%d') AS formatted_date, orders.product, orders.quantity, payments.transaction_id AS ref, users_Info.fullName
      FROM orders
      INNER JOIN users_Info ON orders.customer_id = users_Info.id
      INNER JOIN payments ON orders.payment_id = payments.id
      WHERE orders.customer_id = ?
      ORDER BY orders.date DESC;
    `;

    db.query(query, [userId], (error, results) => {
        if (error) {
            console.error('Error fetching order history:', error);
            res.render('user/myAccount', { status: 'error', error: 'Error fetching order history. Please try again later.' });
        } else {
            console.log('Order History Results:', results)
            const userOrderHistory = results;
            res.render('user/myAccount', { status: 'loggedIn', user: req.user, userOrderHistory });
        }
    });
});


  
 

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
router.post('/check-payment/', loggedIn, async (req, res) => {
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
                    
                    const dbVal ={
                        date: new Date(),
                    }
                    const userId = req.user.id;

                    db.connect((err) => {
                        if (err) {
                            console.error(err);
                        } else {
                            const query = `
                                INSERT INTO payments (transaction_id, date, user_id) VALUES (?,?,?)`;
                
                            const values = [
                                transactionReference,
                                dbVal.date,
                                userId
                            ];
                
                            db.query(query, values, (err, result) => {
                                if (err) {
                                    console.error('Error inserting data into the database:', err);
                                } else {
                                    console.log('Customer ref successfully added to the database');
                                }
                            });
                        }
                    });

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
router.post('/place_order', loggedIn, (req, res) => {
    try {
        // data goes to mysql
        const userId = req.user.id;       

        const checkout_data = {
            name: req.user.fullName,
            email:req.user.email,
            phone: req.body.phone,
            country: req.body.country,
            address: req.body.address,
            zip_code: req.body.zipCode,
            state: req.body.state,
            cost: req.session.total,
            status: 'VERIFIED',
            date: new Date(),
            cart: req.session.cart,
            product: '',
            quantity: 0
        };

        console.log('Details',req.session);
        console.log('User:', req.user);
        console.log('User ID:', userId);

        console.log(req.body);
        if (checkout_data.cart.length > 0) {
            const productDetails = checkout_data.cart.map(product => `${product.name} (Quantity: ${product.quantity})`).join(', ');
            checkout_data.product = productDetails;
            checkout_data.quantity = checkout_data.cart.reduce((total, product) => total + product.quantity, 0);
        }

        db.connect((err) => {
            if (err) {
                console.error(err);
            } else {
                const query = `
                    INSERT INTO orders (name, email, phone, country, address, state, zip_code, status, date, product, quantity, cost, customer_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
                const values = [
                    checkout_data.name,
                    checkout_data.email,
                    checkout_data.phone,
                    checkout_data.country,
                    checkout_data.address,
                    checkout_data.state,
                    checkout_data.zip_code,
                    checkout_data.status,
                    checkout_data.date,
                    checkout_data.product,
                    checkout_data.quantity,
                    checkout_data.cost,
                    userId
                ];
    
                db.query(query, values, (err, result) => {
                    if (err) {
                        console.error('Error inserting data into the database:', err);
                        res.status(500).json('Error inserting data into the database');
                    } else {
                        console.log('Customer data successfully added to the database');
                        res.json('Customer data added successfully');
                    }
                });
            }
        });

        //then to mails
                    const nodemailer = require('nodemailer')
                    const transporter = nodemailer.createTransport({
                        service: 'Gmail',
                        auth: {
                            user: process.env.myEmail,
                            pass:process.env.myEmailPass,
                        }
                    })
                    const productDetails = checkout_data.cart.map(product => `${product.name} (Quantity: ${product.quantity})`).join(', ');

                    const mailOptions = {
                        from: process.env.myEmail,
                        to: 'akereabdulraheem@gmail.com, akunayo7@gmail.com',
                        subject: 'ALERT: NEW ORDER',
                        text:`New order details:
                        Date: ${checkout_data.date}

                        *CUSTOMER DETAILS*
                        Name: ${checkout_data.name}
                        Email: ${checkout_data.email}
                        Phone Number: ${checkout_data.phone}

                        *SHIPPING DETAILS*
                        Country: ${checkout_data.country}
                        Address: ${checkout_data.address}
                        Zip Code :${checkout_data.zip_code}
                        State: ${checkout_data.state}
                        Logistic: 

                        *PRODUCT INFO*
                        Status: ${checkout_data.status}
                        Cost: ${checkout_data.cost}
                        Products: ${productDetails}`
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
    } catch (error) {
        console.log('could not register order data on database')
        console.log('Request body:',req.body);
        console.log('User:', req.user);
        console.log('User ID:', userId);
                    
    }   
});

//............../checkout form validation/
const { body, validationResult } = require('express-validator');
const isValidZipCode = (country, zipCode) => {
    // Define regular expression patterns for zip codes based on country
    const zipCodePatterns = {
        'US': /^\d{5}$/,
        'NG': /^\d{6}$,          // 6-digit //Nigerian zip code
        // Add more country patterns as needed
    };

    // Check if the provided country has a matching pattern
    if (zipCodePatterns[country]) {
        return zipCodePatterns[country].test(zipCode);
    }

    // If the country is not recognized, return false (validation fails)
    return false;
};
// Validation rules for the form fields
const validationRules = [
    body('lastName').notEmpty().withMessage('Last Name is required'),
    body('firstName').notEmpty().withMessage('First Name is required'),
    body('email').isEmail().withMessage('Invalid Email'),
    body('phone').notEmpty().withMessage('Phone Number is required'),
    body('country').notEmpty().withMessage('Country is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('zipCode').custom(isValidZipCode).withMessage('Invalid Zip Code'),
    body('state').notEmpty().withMessage('State is required'),
    body('amount').notEmpty().withMessage('Amount is required'),
    body('key').notEmpty().withMessage('Key is required'),
];

router.post('/validate-form', validationRules, (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // If the form data is valid, you can proceed to process it
    const formData = req.body;

    res.sendStatus(200); // Success status code
});


///test
router.get('/loadData', (req,res) => {
    res.render('pages/payment')
})
router.post('/loadData', (req, res) => {
    
});
//the end

module.exports =router;