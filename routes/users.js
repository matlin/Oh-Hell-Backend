var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

router.post('/register', (req, res, next) => {
  //check req body for username, email, pw, etc and on success set cookie
  res.cookie('user', 'value', {expire : new Date() + 9999}).send("Succesfully register");
});

router.post('/login', (req, res, next) => {
  //check credentials then update cookie
});

router.get('/logout', (req,res, next) => {
     clearCookie('cookie_name');
     res.send('Succesfully logged out.');
});

module.exports = router;
