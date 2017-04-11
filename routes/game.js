let express = require('express');
let router = express.Router();
let Game = require('../game/game.js')

let activeGames = new Map();
let idCounter = 0;

router.get('/', function(req, res, next) {
  res.send('No game has been created.');
});

//change to post
router.post('/create/', (req, res, next) => {
  let minPlayers = req.params.minPlayers;
  let maxPlayers = req.params.maxPlayers;
  let userID = req.cookies.userID;
  let newGame = new Game(idCounter, minPlayers, maxPlayers)
  newGame.addPlayer(userID);
  activeGames[idCounter] = newGame;
  idCounter++;
  res.send('Created new game');
});

router.get('/:id'), (req, res, next) => {
  //give game info for that player
});

router.put('/:id/bet', (req, res, next) => {
  req.playerID
  req.amountBet
  activeGames[id].bet(player, amount)

});

router.put('/:id/play', (req, res, next) {

});
module.exports = router;
