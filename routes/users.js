const express = require('express');
const shortid = require('shortid');
const router = express.Router();
let users = {};

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

router.post('/register', (req, res, next) => {
  //check req body for username, email, pw, etc and on success set cookie
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  const id = shortid.generate();
  users[id] = {username:username,password:password,email:email};
  res.cookie('id', id, {expire : new Date() + 9999}).send("Succesfully register");
});

router.post('/login', (req, res, next) => {
  console.log(users);
  if (req.cookies.id && users[req.cookies.id]){
    res.send("Welcome back " + users[req.cookies.id].username);
  } else {
    const username = req.body.username;
    const password = req.body.password;
    for (let id in users){
      if (users[id].username === username && users[id].password === password){
        res.cookie('id', id, {expire : new Date() + 9999}).send("Logged in");
        return
      }
    }
    res.status = 401;
    res.send("Email or password do not match.");
  }
});

router.get('/logout', (req,res, next) => {
     res.clearCookie('id');
     res.send('Succesfully logged out.');
});

module.exports = router;
