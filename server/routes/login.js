const express = require('express');
const router = express.Router();

router.get('/login',(req, res) => {
	res.sendFile(__dirname + '/../views/user/login.html');
});

module.exports = router;