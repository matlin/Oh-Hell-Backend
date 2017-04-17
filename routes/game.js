const express = require('express');
const router = express.Router();
const Game = require('../game/game.js')
const mongoose = require('mongoose');
let db = mongoose.connection;

mongoose.connect('mongodb://localhost:5000');

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Users routes are connected!")
});


let activeGames = new Map();
let idCounter = 0;

router.get('/', function(req, res, next) {
  res.send('No game has been created.');
});

// route handling the creation of a game.
// Body of request must specify min and max number of players in this game.
// Sends back confirmation
router.post('/create', (req, res, next) => {
  let minPlayers = req.body.minPlayers;
  let maxPlayers = req.body.maxPlayers;
  let userID = "Kevin"; //placeholder because we don't know how cookies work
  let newGame = new Game(idCounter, minPlayers, maxPlayers)
  newGame.addPlayer(userID);
  activeGames[idCounter] = newGame;
  idCounter++;
  // update the DB with this new game
  res.sendStatus(200);
});

//route handling adding players to a game
//body of request has to have the cookie for user-id
//sends confirmations
router.put('/:id/join', (req,res,next) => {
  let userID = "Mark"; //still dont know how cookies work
  let currentGame = activeGames[req.params.id];
  currentGame.addPlayer(userID);
  console.log(currentGame);
  res.sendStatus(200); //this will evenetually send back who else has joined the game. sockets?
});

// route handling starting a pre-existing game
// TODO: is the creator of the game the only person who can start it?
// Sends back the state of game that's just starting
router.put('/:id/start', (req, res, next) => {
  let currentGame = activeGames[req.params.id];
  let userID = req.cookies.userID;
  currentGame.start(); //Do we need to check who is trying to start the game?
  // update the DB
  res.send(currentGame.getPlayerState(userID));
});

// route handling updating all users besides the one who played or bet (probably)
// sends back the state of the game
router.get('/:id', (req, res, next) => {
  let currentGame = activeGames[req.params.id];
  let userID = req.cookies.userID; //placeholder because we don't know how cookies work
  res.send(currentGame.getPlayerState(userID));
});

// route handling playing a card
// request body must have a card object.
// TODO: add functionality to Game class that checks if card is in player's hand
// sends back a message and gamestate. Message will describes whether the play was successful.
router.put('/:id/play', (req, res, next) => {
  let currentGame = activeGames[req.params.id];
  let userID = req.cookies.userID; //placeholder because we don't know how cookies work
  let card = req.body.card;
  //play needs to check 1. its this user's turn 2. if they have the specified card in their hand 3. if this is the right time to play a card
  let message = currentGame.play(userID, card);
  // update the DB
  res.send({message: message, state: currentGame.getPlayerState(userID)});
});

// route handling playing a card
// request body must have a card object.
// TODO: add functionality to Game class that checks if bet amount is OK
// sends back a message and gamestate. Message will describes whether the bet was successful.
router.put('/:id/bet', (req, res, next) => {
  let currentGame = activeGames[req.params.id];
  let userID = req.cookies.userID; //placeholder because we don't know how cookies work
  let betAmount = req.body.bet;
  // bet (yet to be implemented) needs to check if 1. it's this users turn 2. this bet amound is allowed (only a problem for the last player)
  let message = activeGames[id].bet(player, amount);
  // update the DB
  res.send({message: message, state: currentGame.getPlayerState(userID)});
});


module.exports = router;
