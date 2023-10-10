// const db = require('../routes/db');
// const jwt = require('jsonwebtoken')

// const loggedIn = (req, res, next) => {
//     try {
//        if (!req.cookie.userRegistered) return next();
//        try {
//         const decoded = jwt.verify(req.cookie.userRegistered, process.env.JWS_SECRET_KEY);
//         db.query('SELECT * from user where id = ?', (decoded.id), (err, result) => {
//             if(err) throw err;
//             req.user = result[0];
//         })
//        } catch (error) {
        
//        }
//     } catch (error) {
//         if(err) throw err;
//     }
// }
// module.exports = loggedIn;