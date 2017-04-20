const express = require('express');
const shortid = require('shortid');
const router = express.Router();
const Game = require('../game/game.js')
const mongoose = require('mongoose');
let db = mongoose.connection;

mongoose.connect('mongodb://localhost:5000');

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Users routes are connected!")
});

const User = mongoose.model('User');


let activeGames = new Map();
activeGames.set('test', new Game());

router.get('/', function(req, res, next) {
  res.send('No game has been created.');
});

// route handling the creation of a game.
// Body of request must specify min and max number of players in this game.
// Sends back confirmation
router.post('/create', (req, res, next) => {
  //let minPlayers = req.body.minPlayers;
  let maxPlayers = req.body.maxPlayers;
  let userID = req.cookies.id || "User";
  let gameID = shortid.generate();
  let newGame = new Game(maxPlayers);
  User.findOne({_id : userID}, (err, user) => {
    if(user){
      const username = user.username;
      newGame.addPlayer(userID, username);
      activeGames.set(gameID, newGame);
      // update the DB with this new game
      console.log('Game succesfully created.', gameID);
      res.send(gameID);
    }else{
      console.log("Could not get user");
      res.status = 422;
      res.send("An error occurred while joining game");
    }
  });
});

//route handling adding players to a game
//body of request has to have the cookie for user-id
//sends confirmations
router.put('/:id/join', (req,res,next) => {
  let userID = req.cookies.id;
  let currentGame = activeGames.get(req.params.id);
  User.findOne({_id : userID}, (err, user) => {
    if(user){
      const username = user.username;
      const gameID = req.params.id;
      currentGame.addPlayer(userID, username);
      console.log(`${username} joined game ${gameID}`);
      res.send(gameID);
    }else{
      console.log("Could not get user");
      res.status = 422;
      res.send("An error occurred while joining game");
    }
  });
});

// route handling starting a pre-existing game
// TODO: is the creator of the game the only person who can start it?
// Sends back the state of game that's just starting
router.put('/:id/start', (req, res, next) => {
  let currentGame = activeGames.get(req.params.id);
  let userID = req.cookies.id || "Mark";
  currentGame.start(); //Do we need to check who is trying to start the game?
  //console.log(currentGame);
  // update the DB
  if (currentGame){
    res.send('Game started');
  }else{
    res.send('Could not find game');
  }
  //res.send(currentGame.getPlayerState(userID));
});

// route handling updating all users besides the one who played or bet (probably)
// sends back the state of the game
router.get('/:id', (req, res, next) => {
  let currentGame = activeGames.get(req.params.id);
  let userID = req.cookies.id; //placeholder because we don't know how cookies work
  if (currentGame){
    res.send("You found a game.");
  }else{
    res.send("No game found");
  }
  //res.send(currentGame.getPlayerState(userID));
});

// route handling playing a card
// request body must have a card object.
// TODO: add functionality to Game class that checks if card is in player's hand
// sends back a message and gamestate. Message will describes whether the play was successful.
router.put('/:id/play', (req, res, next) => {
  let currentGame = activeGames.get(req.params.id);
  let userID = req.cookies.id; //placeholder because we don't know how cookies work
  let card = req.body.card;
  //play needs to check 1. its this user's turn 2. if they have the specified card in their hand 3. if this is the right time to play a card
  let message = currentGame.play(userID, card);
  // update the DB
  //res.send({message: message, state: currentGame.getPlayerState(userID)});
  res.send('You tried to play');
});

router.get('/:id/hand', (req, res, next) => {
  let currentGame = activeGames.get(req.params.id);
  let userID = req.cookies.id; //placeholder because we don't know how cookies work
  let hand = currentGame.getPlayer(userID).hand;
  console.log(currentGame.getPlayer(userID).username + " retrieved their hand.");
  res.send(JSON.stringify(hand));
});

// route handling playing a card
// request body must have a card object.
// TODO: add functionality to Game class that checks if bet amount is OK
// sends back a message and gamestate. Message will describes whether the bet was successful.
router.put('/:id/bet', (req, res, next) => {
  let currentGame = activeGames.get(req.params.id);
  let userID = req.cookies.id; //placeholder because we don't know how cookies work
  let betAmount = req.body.bet;
  // bet (yet to be implemented) needs to check if 1. it's this users turn 2. this bet amound is allowed (only a problem for the last player)
  let message = currentGame.bet(userID, +betAmount);
  // update the DB
  if (currentGame){
    res.send("Bet complete");
  }else{
    res.send("No game found");
  }
  //res.send({message: message, state: currentGame.getPlayerState(userID)});
});


module.exports = router;
