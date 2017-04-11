var express = require('express');
var router = express.Router();
var Game = require('../game/game.js')

let activeGames = new Map();
let idCounter = 0;

router.get('/', function(req, res, next) {
  res.send('No game has been created.');
});

//change to post
router.post('/create/', (req, res, next) {
  let newGame = new Game();
  activeGames[idCounter] = newGame;
  idCounter++;
  res.send('Created new game');
});

router.get('/:id'), (req, res, next) {
  //give game info for that player
});

router.put('/:id/bet', (req, res, next) {
  req.playerID
  req.amountBet
  activeGames[id].bet(player, amount)

});

router.put('/:id/play', (req, res, next) {

});
module.exports = router;
