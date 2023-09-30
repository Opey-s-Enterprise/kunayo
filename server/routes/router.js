const express =require('express');
const router = express.Router();
const path = require('path');
const projectRoot = path.resolve(__dirname, '..', '..');

router.get('/', (req,res) => {
    res.sendFile(path.join(projectRoot, 'public', 'index.html'));
});

router.get('/login', (req,res) => {
    res.sendFile(path.join(projectRoot, 'views', 'user', 'login.html'));
});

router.get('/signup', (req,res) => {
    res.sendFile(path.join(projectRoot, 'views', 'user', 'signup.html'));
});

module.exports =router;