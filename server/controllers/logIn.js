const jwt = require('jsonwebtoken');
const db = require('../routes/db');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv').config();

const login = async (req, res) => { // async added because of bcryt
    const {email, password: Npassword} = req.body
    if (!email || !password) return res.json({status: 'error', error: 'Please enter email and password'});
    else{
        db.query('select email from user_Info where email =?', [email], async( err, results) => {
            if (err) throw err;
            if (!results[0] || ! await bcrypt.compare(password, result[0].password)) return res.json({status: 'error', error: 'Incorrect email or pasword!'})
            else{
                const token = jwt.sign({id:result[0].id}, process.env.JWS_SECRET_KEY,{
                    expiresIn: process.env.JWT_EXPIRES,
                    httpOnly: true 
                })
                const cookieOptions = {
                    expiresIn: newDate(Date.now() + process.env.COOKIE_EXPIRES *24 *60 * 60 * 1000),
                    httpOnly: true 
                }
                res.cookie('userRegistered', token, cookieOptions);
                return res.json({status:'success', success:'User has been logged In'})
            }
        })
    }
}

module.exports =login;