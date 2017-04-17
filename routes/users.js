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

const User = mongoose.model('User', {
  username: String,
  email: String,
  password: String
});

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

// TODO: make user cookie a hashed ID, not the ID assigned by the database.
router.post('/register', (req, res, next) => {
  //check req body for username, email, pw, etc and on success set cookie
  if (req.body.username && req.body.password && req.body.email){
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    User.findOne({email: email}, function (err, user) {
      if (err) return console.error(err);
      // is the email we're trying to register with already in the db?
      if (!user) {
        const newUser = new User({username, email, password});
        newUser.save(function (err) {
          if (err) return console.error(err);
          // lets get the entry we just added out of the db to assign a cookie
          User.findOne({email: email}, function (err, user) {
            if (err) return console.error(err);
            if (user) {
              res.cookie('id', user._id, {expire : new Date() + 9999}).send("Succesfully register");
            }
            else console.log("couldn't find our new entry");
          });
        });
      } else {
        console.log("An error occurred during registration");
        res.status = 422;
        res.send("An error occurred during registration");
      }
    });
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
