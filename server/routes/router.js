const express =require('express'),
    router = express.Router(),
    path = require('path'),
    projectRoot = path.resolve(__dirname, '..', '..'),
    db = require('./db.js'),
    bcrypt = require('bcryptjs'),
    loggedIn = require('../controllers/loggedIn'),
    logout = require('../controllers/logOut'),
    Product =require('../models/products.js'),
    dotenv = require('dotenv').config(),
    nodemailer = require('nodemailer'),
    axios = require('axios');

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
router.get('/', (req, res) => {
    const query = `
        SELECT * FROM (
            SELECT *, 
                   ROW_NUMBER() OVER (PARTITION BY type ORDER BY id) as rn
            FROM products
        ) as ranked
        WHERE rn <= 2
    `;

    db.query(query, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }

        // Group products by category
        const productsByCategory = result.reduce((acc, product) => {
            const { type } = product;
            if (!acc[type]) {
                acc[type] = [];
            }
            acc[type].push(product);
            return acc;
        }, {});

        res.render('pages/Home', { productsByCategory });
    });
});

// router.get('/', (req,res) => {
//     db.query('select * from products', (err, result) => {
//     res.render('pages/Home')
//     });
// });

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
router.get('/lookbook', (req,res) => {
    res.render('pages/lookbook', {pagetitle: 'lookbook', pageDescription: 'lookbook'})
});
router.get('/product-details', (req, res) => {
    const productId = req.query.product_id;
    if (!productId) {
        return res.status(400).send('Product ID is required');
    }
    const query = 'SELECT * FROM products WHERE id = ?';
    db.query(query, [productId], (error, results) => {
        if (error) {
            console.error('Error querying the database:', error);
            return res.status(500).send('Server error');
        }

        if (results.length > 0) {
            const product = results[0];

            // Check if image data exists and encode it in Base64
            if (product.image) {
                product.imageBase64 = product.image.toString('base64');
                product.imageMimeType = 'image/jpeg';
            }

            const pagetitle = `Product Details - ${product.name}`;
            res.render('product/product-details', { product, pagetitle });
        } else {
            res.status(404).send('Product not found');
        }
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
// Utility Functions
function isProductInCart(cart, productId) {
    return cart.some(item => item.id === productId);
}

function calculateTotal(cart, req) {
    let subTotal = 0;

    // Calculate subTotal
    for (const item of cart) {
        const price = item.sale_price || item.price;
        subTotal += price * item.quantity;
    }

    // Get shipping cost and calculate total
    const shippingCost = parseFloat(req.session.shippingCost) || 0;
    const total = parseFloat(subTotal) + shippingCost;
    

    // Save total in session
    req.session.subTotal = subTotal;
    req.session.total = total;

    return total;
}

// Routes
router.post('/add-to-cart', (req, res) => {
    const {
        product_id: productId,
        product_name: productName,
        product_price: productPrice,
        product_image: productImage,
        quantity: productQuantity,
        sale_price: productSalePrice
    } = req.body;

    const product = {
        id: productId,
        name: productName,
        price: parseFloat(productPrice),
        quantity: parseInt(productQuantity, 10),
        image: productImage,
        sale_price: parseFloat(productSalePrice) || undefined
    };

    if (!req.session.cart) {
        req.session.cart = [];
    }

    const cart = req.session.cart;

    if (!isProductInCart(cart, productId)) {
        cart.push(product);
    }

    calculateTotal(cart, req);

    res.redirect(req.get('Referer'));
});

router.get('/cart', loggedIn, (req, res) => {
    if (!req.session) {
        res.status(500).send('Session is not properly initialized');
        return;
    }

    // Retrieve values from the session
    const cart = req.session.cart || [];
    const subTotal = req.session.subTotal || 0;
    const total = req.session.total || 0;
    const shippingLocation = req.session.shippingLocation || null;
    const userStatus = req.user ? 'loggedIn' : 'no';

    // Render the cart page with the retrieved values
    res.render('pages/cart', {
        cart,
        subTotal,         // Send subTotal to the view
        total,            // Send total to the view
        shippingLocation,
        status: userStatus,
        user: req.user || 'nothing'
    });
});

router.post('/remove_product', (req, res) => {
    const { id } = req.body;
    const cart = req.session.cart || [];

    const index = cart.findIndex(item => item.id === id);
    if (index !== -1) {
        cart.splice(index, 1);
    }

    calculateTotal(cart, req);

    res.redirect('/cart');
});

router.post('/edit_product_quantity', (req, res) => {
    const { id, increaseProductQuantity, decreaseProductQuantity } = req.body;
    const cart = req.session.cart || [];

    const item = cart.find(item => item.id === id);
    if (item) {
        if (increaseProductQuantity) {
            item.quantity += 1;
        }

        if (decreaseProductQuantity && item.quantity > 1) {
            item.quantity -= 1;
        }
    }

    calculateTotal(cart, req);

    res.redirect('/cart');
});


router.post('/update-shipping', (req, res) => {
    const shippingLocation = req.body.shipping_location;

    if (!shippingLocation) {
        res.status(400).send('Shipping location is required');
        return;
    }

    // Query the database for the shipping cost
    db.query('SELECT cost FROM shipping_costs WHERE location = ?', [shippingLocation], (err, results) => {
        if (err) {
            console.error('Error retrieving shipping cost:', err);
            res.status(500).send('Error retrieving shipping cost');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('Shipping location not found');
            return;
        }

        const shippingCost = results[0].cost;

        req.session.shippingLocation = shippingLocation;
        req.session.shippingCost = shippingCost;

        // Update cart total
        const cart = req.session.cart || [];
        calculateTotal(cart, req);

        // Redirect to the referring page or a default page
        const referer = req.get('Referer') || '/default-page'; // Ensure fallback URL
        res.redirect(referer);
    });
});

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

router.post('/place_order', loggedIn, (req, res) => {
    try {
        const userId = req.user.id;

        const checkout_data = {
            name: req.user.fullName,
            email: req.user.email,
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

        console.log('Details:', req.session);
        console.log('User:', req.user);
        console.log('User ID:', userId);
        console.log(req.body);

        if (checkout_data.cart.length > 0) {
            const productDetails = checkout_data.cart.map(product => `${product.name} (Quantity: ${product.quantity})`).join(', ');
            checkout_data.product = productDetails;
            checkout_data.quantity = checkout_data.cart.reduce((total, product) => total + product.quantity, 0);
        }

        const insertOrder = async () => {
            return new Promise((resolve, reject) => {
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
                        reject(err);
                    } else {
                        console.log('Customer data successfully added to the database');
                        resolve(result);
                    }
                });
            });
        };

        const sendConfirmationEmail = async () => {
            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.myEmail,
                    pass: process.env.myEmailPass,
                }
            });

            const productDetails = checkout_data.cart.map(product => `${product.name} (Quantity: ${product.quantity})`).join(', ');

            const mailOptions = {
                from: process.env.myEmail,
                to: 'akereabdulraheem@gmail.com, shopkunayo@gmail.com, akunayo7@gmail.com',
                subject: 'ALERT: NEW ORDER',
                text: `New order details:
                Date: ${checkout_data.date}

                *CUSTOMER DETAILS*
                Name: ${checkout_data.name}
                Email: ${checkout_data.email}
                Phone Number: ${checkout_data.phone}

                *SHIPPING DETAILS*
                Country: ${checkout_data.country}
                Address: ${checkout_data.address}
                Zip Code: ${checkout_data.zip_code}
                State: ${checkout_data.state}
                Logistic:

                *PRODUCT INFO*
                Status: ${checkout_data.status}
                Cost: ${checkout_data.cost}
                Products: ${productDetails}`
            };

            return new Promise((resolve, reject) => {
                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        console.log('Email sent');
                        resolve(info);
                    }
                });
            });
        };

        const updateProductQuantities = async () => {
            // Create an array of update promises
            const updatePromises = checkout_data.cart.map(product => {
                return new Promise((resolve, reject) => {
                    const query = 'UPDATE products SET quantity = quantity - ? WHERE id = ?';
                    db.query(query, [product.quantity, product.id], (err, results) => {
                        if (err) {
                            console.error(`Error updating product ${product.id}:`, err.message);
                            reject(err);
                        } else {
                            console.log(`Product ${product.id} quantity updated`);
                            resolve(results);
                        }
                    });
                });
            });

            // Wait for all update promises to complete
            return Promise.all(updatePromises);
        };

        const processOrder = async () => {
            try {
                await insertOrder();
                await sendConfirmationEmail();
                await updateProductQuantities();
                res.json('Order placed successfully and products updated');
            } catch (error) {
                console.error('Error processing order:', error.message);
                res.status(500).json('Error processing order');
            }
        };

        processOrder();
    } catch (error) {
        console.log('Could not register order data on database');
        console.log('Request body:', req.body);
        console.log('User:', req.user);
        res.status(500).json('Internal server error');
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

//the end

module.exports =router;