const express = require('express');
const shortid = require('shortid');
const mongoose = require('mongoose');
const router = express.Router();

mongoose.connect('mongodb://localhost:5000/ohell/');

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Users routes are connected!")
});

const userSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String
});

const User = mongoose.model('User', userSchema);

const phil = new User({username: "pbohlman", email: "pbohlman@gmail.com", password: "philspwd"});

/*
phil.save(function (err) {
  if (err) return console.error(err);
});
*/

User.find(function (err, users) {
  if (err) return console.error(err);
  console.log(users);
});

let users = {};

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

router.post('/register', (req, res, next) => {
  //check req body for username, email, pw, etc and on success set cookie
  if (req.body.username && req.body.password && req.body.email){
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const id = shortid.generate();
    users[id] = {username:username,password:password,email:email};
    res.cookie('id', id, {expire : new Date() + 9999}).send("Succesfully register");
  } else {
    res.status = 422;
    res.send("Registration information incomplete");
  }
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
