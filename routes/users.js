const express = require("express");
const shortid = require("shortid");
const mongoose = require("mongoose");
const router = express.Router();

// specificying /ohell/ connects us to the ohell DB
mongoose.connect(process.env.DBURL || "mongodb://localhost:5000/ohell/");
let db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  console.log("Users routes are connected!");
});

// User Schema
const User = mongoose.model("User", {
  username: { type: String, index: { unique: true } },
  email: { type: String, unique: true },
  password: String
});

/* GET users listing. */
router.get("/", (req, res, next) => {
  res.send("respond with a resource");
});

/* POST Route for handling registration. Takes a unique username and a unique
 * email and a password. Will give the user a cookie if they register
 * sucessfully.
 */
router.post("/register", (req, res, next) => {
  //check req body for username, email, pw, etc and on success set cookie
  if (req.body.username && req.body.password && req.body.email) {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    User.findOne({ email }, function(err, user) {
      if (err) return console.error(err);
      // is the email we're trying to register with already in the db?
      console.log("Registering", username, password, email, user);
      if (!user) {
        const newUser = new User({ username, email, password });
        newUser.save(function(err) {
          if (err) return console.error(err);
          // lets get the entry we just added out of the db to assign a cookie
          User.findOne({ email }, function(err, user) {
            if (err) return console.error(err);
            if (user) {
              res.clearCookie("id"); //in case they were already logged in
              res
                .cookie("id", user._id, { expire: new Date() + 9999 })
                .send({ user: user.username });
            } else console.log("couldn't find our new entry");
          });
        });
      } else {
        console.log("Registration request was incomplete");
        res.status = 422;
        res.send("An error occurred during registration");
      }
    });
  } else {
    // request body was missing a field
    res.status = 422;
    res.send("Registration information incomplete");
  }
});

/* POST Route for handling login. Takes an email and passowrd. Will give the
 * user a cookie if they register succesfully.
 */
router.post("/login", (req, res, next) => {
  if (req.cookies.id) {
    const _id = req.cookies.id;
    User.findOne({ _id }, { _id: 0, email: 0, password: 0 }, function(
      err,
      user
    ) {
      if (err) return console.error(err);
      if (user) res.send({ user: user.username });
    });
  } else {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email, password }, function(err, user) {
      if (err) return console.error(err);
      if (user) {
        // correct information
        res
          .cookie("id", user._id, { expire: new Date() + 9999 })
          .send({ user: user.username });
      } else {
        // incorrect information
        res.status = 401;
        res.send("Email or password do not match.");
      }
    });
  }
});

// A route for logging a user out. Clears their cookie.
router.get("/logout", (req, res, next) => {
  res.clearCookie("id");
  res.send("Succesfully logged out.");
});

module.exports = router;
