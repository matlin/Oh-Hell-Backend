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

const io = require('socket.io')(4001);
io.on('connection', (socket) => {
  console.log('User connected');
  socket.on('join', (id) => {
    console.log('user joined' , id);
    socket.join(id);
  });
});

const User = mongoose.model('User');


let activeGames = new Map();
activeGames.set('test', new Game('test', 'philsTest'));

// TODO: add this as functionality to future Lobby Class
// returns an array of current games with minimal information;
function exportGameList(userID) {
  joinedGames = [];
  openGames = []
  const lobbySummary = (game, _userID) => {
    return {
      id: game.state.id,
      gameName: game.state.gameName,
      playersInGame: game.state.players.length,
      maxPlayers: game.state.maxPlayers,
      isOwner: JSON.stringify(_userID) === JSON.stringify(game.state.owner),
      hasPassword: game.state.password != null && game.state.password !== ""
    };
  };
  activeGames.forEach(
    game => {
      if (game.getPlayer(userID)) {
        joinedGames.push(lobbySummary(game, userID));
      } else if (game.state.players.length < game.state.maxPlayers) {
        openGames.push(lobbySummary(game, userID));
      }
    }
  );
  return {joinedGames, openGames};
};

router.use((req, res, next) => {
  let userID = req.cookies.id;
  User.findOne({_id : userID}, (err, user) => {
    if(user){
      req.user = user;
      next();
    }else{
      res.send('User not logged in');
    }
  });
});

// serves the gamelist
router.get('/', function(req, res, next) {
  let userID = req.cookies.id;
  const gameList = JSON.stringify(exportGameList(userID));
  res.send(gameList);
});


// route handling the creation of a game.
// Body of request must specify min and max number of players in this game.
// Sends back confirmation
router.post('/create', (req, res, next) => {
  const maxPlayers = req.body.maxPlayers;
  const gameID = shortid.generate();
  const username = req.user.username;
  const userID = req.user._id;
  let newGame;
  if (req.body.password){
    newGame = new Game(gameID, userID, req.body.gameName, req.body.password);
  } else {
    newGame = new Game(gameID, userID, req.body.gameName);
  }
  newGame.addPlayer(userID, username);
  activeGames.set(gameID, newGame);
  const gameList = JSON.stringify(exportGameList(userID));
  res.send(gameList);
});

router.delete('/:id/delete', (req, res, next) => {
  let userID = req.user._id;
  let currentGame = activeGames.get(req.params.id);
  if(req.user && currentGame && (JSON.stringify(userID) === JSON.stringify(currentGame.state.owner))){
    activeGames.delete(req.params.id);
    const gameList = JSON.stringify(exportGameList(userID));
    res.send(gameList);
  } else {
    res.status = 403;
    res.send('Only the game owner can delete the game');
  }
});

//route handling adding players to a game
//body of request has to have the cookie for user-id
//sends confirmations
router.put('/:id/join', (req,res,next) => {
  let userID = req.user._id;
  let currentGame = activeGames.get(req.params.id);
  let message;
  if(req.user && currentGame){
    if (!currentGame.state.players.includes(currentGame.getPlayer(userID)) && (currentGame.state.password == null || req.body.password === currentGame.state.password)){
      const username = req.user.username;
      const gameID = req.params.id;
      message = currentGame.addPlayer(userID, username);
    } else {
      message = "You're already in the game!";
    }
  }else{
    message = "An error occurred while joining game. Could not get user.";
    res.status = 422;
  }
  res.send({
    message: message,
    state: currentGame.export(userID),
  });

});

// route handling starting a pre-existing game
// TODO: is the creator of the game the only person who can start it?
// Sends back the state of game that's just starting
router.put('/:id/start', (req, res, next) => {
  let currentGame = activeGames.get(req.params.id);
  let userID = req.user._id;
  let message;
   //Do we need to check who is trying to start the game?
  // update the DB
  if (currentGame && (JSON.stringify(userID) === JSON.stringify(currentGame.state.owner))){
    currentGame.start();
    message = 'Game started';
    res.send({
      message: message,
      state: currentGame.export(userID),
    });
    io.in(req.params.id).emit('update');
    res.sendStatus(200);
    //res.send(response);
    //this.socket.emit(response)
  }else{
    res.status = 403;
    message = 'Only the owner can start the game';
    res.send({
      message: message,
      state: currentGame.export(userID),
    });
  }
  //res.send(currentGame.getPlayerState(userID));
});

// route handling updating all users besides the one who played or bet (probably)
// sends back the state of the game
router.get('/:id', (req, res, next) => {
  let currentGame = activeGames.get(req.params.id);
  let userID = req.user._id;
  let message, state;
  if (currentGame){
    state = currentGame.export(userID);
    state.joined = true;
    if (!currentGame.state.players.includes(currentGame.getPlayer(userID))){
      message = "You are not in this game.";
      state.joined = false;
    }
    res.send({
      message:message,
      state: state
    });
  }else{
    res.send({alert: "No game found"});
  }
  //res.send(currentGame.getPlayerState(userID));
});

// route handling playing a card
// request body must have a card object.
// TODO: add functionality to Game class that checks if card is in player's hand
// sends back a message and gamestate. Message will describes whether the play was successful.
router.put('/:id/play', (req, res, next) => {
  let currentGame = activeGames.get(req.params.id);
  let userID = req.user._id; //placeholder because we don't know how cookies work
  let card = req.body.card;
  //play needs to check 1. its this user's turn 2. if they have the specified card in their hand 3. if this is the right time to play a card
  let message = currentGame.play(userID, card);
  // update the DB
  //res.send({message: message, state: currentGame.getPlayerState(userID)});
  io.in(req.params.id).emit('update');
  res.send({alert: message});
  // delete response.state.hand;
});

router.get('/:id/hand', (req, res, next) => {
  let currentGame = activeGames.get(req.params.id);
  let userID = req.user._id; //placeholder because we don't know how cookies work
  let hand = currentGame.getPlayer(userID).hand;
  console.log(currentGame.getPlayer(userID).username + " retrieved their hand.");
  res.send({hand: hand});
});

// route handling playing a card
// request body must have a card object.
// TODO: add functionality to Game class that checks if bet amount is OK
// sends back a message and gamestate. Message will describes whether the bet was successful.
router.put('/:id/bet', (req, res, next) => {
  let currentGame = activeGames.get(req.params.id);
  let userID = req.user._id; //placeholder because we don't know how cookies work
  let betAmount = req.body.bet;
  // bet (yet to be implemented) needs to check if 1. it's this users turn 2. this bet amound is allowed (only a problem for the last player)
  let message = currentGame.bet(userID, +betAmount);
  // update the DB
  if (currentGame){
    let response = {
      message:message,
      state:currentGame.export(userID)
    }
    io.in(req.params.id).emit('update');
    res.send({alert: message});
    // delete response.state.hand;
    // console.log(response);
  }else{
    res.send({alert:"No game found"});
  }
  //res.send({message: message, state: currentGame.getPlayerState(userID)});
});


module.exports = router;
