const express = require('express');
const router = express.Router();
const login = require('./logIn');
const logout = require('./logOut');
const signup = require('./signup');

router.post('/signup',signup);
router.post('/login', login);
router.get('/logout', logout)

module.exports= router;