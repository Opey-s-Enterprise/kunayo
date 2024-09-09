const db = require('../routes/db');
const jwt = require('jsonwebtoken');

const loggedIn = (req, res, next) => {
       if (!req.cookies.userRegistered) return next();

        try {
            const decoded = jwt.verify(req.cookies.userRegistered, process.env.JWS_SECRET_KEY);
            db.query('SELECT * from users_Info where id = ?', (decoded.id), (err, result) => {
                if(err) throw err;
                req.user = result[0];
                return next();
            })
        } catch (error) {
            console.log(err); 
            return next();
        }
}
module.exports = loggedIn;