const express = require("express");
const shortid = require("shortid");
const router = express.Router();
const Game = require("../game/game.js");
const mongoose = require("mongoose");
/*let db = mongoose.connection;

mongoose.connect('mongodb://localhost:5000');

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Users routes are connected!")
});*/

const User = mongoose.model("User");

let activeGames = new Map();

/* Takes a userID returns a list of games that the user should be able to see
 * in the lobby. This list is served on routes that handle updating the lobby.
 */
function exportGameList(userID) {
  joinedGames = [];
  openGames = [];
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
  activeGames.forEach(game => {
    if (game.getPlayer(userID)) {
      joinedGames.push(lobbySummary(game, userID));
    } else if (game.state.players.length < game.state.maxPlayers) {
      openGames.push(lobbySummary(game, userID));
    }
  });
  return { joinedGames, openGames };
}

/* This middleware will prevent any unauthenticated user from making requests.
 * If a user is authenticated, adds their ID to the request for use in routes.
 */
router.use((req, res, next) => {
  let userID = req.cookies.id;
  User.findOne({ _id: userID }, (err, user) => {
    if (user) {
      //req.user = Object.assign({}, user, {_id: user._id.toString()});
      req.user = {
        username: user.username,
        _id: user._id.toString(),
        email: user.email
      };
      console.log(req.user);
      next();
    } else {
      res.send("User not logged in");
    }
  });
});


// GET: Serves the list of games to be displayed in a user's lobby.
router.get("/", function(req, res, next) {
  console.log(req.io);
  let userID = req.cookies.id;
  const gameList = JSON.stringify(exportGameList(userID));
  res.send(gameList);
});

/* POST: Takes a gamename and optional password and instatiates the game.
 * Sends the new list of games for the lobby.
 */
router.post("/create", (req, res, next) => {
  const maxPlayers = req.body.maxPlayers;
  const gameID = shortid.generate();
  const username = req.user.username;
  const userID = req.user._id;
  let newGame;
  if (req.body.password) {
    newGame = new Game(gameID, userID, req.body.gameName, req.body.password);
  } else {
    newGame = new Game(gameID, userID, req.body.gameName);
  }
  newGame.addPlayer(userID, username);
  activeGames.set(gameID, newGame);
  const gameList = JSON.stringify(exportGameList(userID));
  res.send(gameList);
});

/* DELETE: Allows game owners to delete games they've created, at any
 * stage. Sends the new list of games for the lobby.
 */
router.delete("/:id/delete", (req, res, next) => {
  let userID = req.user._id;
  let currentGame = activeGames.get(req.params.id);
  if (
    req.user &&
    currentGame &&
    JSON.stringify(userID) === JSON.stringify(currentGame.state.owner)
  ) {
    activeGames.delete(req.params.id);
    const gameList = JSON.stringify(exportGameList(userID));
    res.send(gameList);
  } else {
    res.status = 403;
    res.send("Only the game owner can delete the game");
  }
});

/* PUT: Adds a user to a game. If the game has a password, it will check the
 * request for the proper password. Sends the gamestate if succesfully joined.
 * TODO: This should serve an alert if game joining fails.
 */
router.put("/:id/join", (req, res, next) => {
  let userID = req.user._id;
  let currentGame = activeGames.get(req.params.id);
  let message;
  if (req.user && currentGame) {
    if (
      !currentGame.state.players.includes(currentGame.getPlayer(userID)) &&
      (currentGame.state.password == null ||
        req.body.password === currentGame.state.password)
    ) {
      const username = req.user.username;
      const gameID = req.params.id;
      message = currentGame.addPlayer(userID, username);
    } else {
      message = "You're already in the game!";
    }
  } else {
    message = "An error occurred while joining game. Could not get user.";
    res.status = 422;
  }
  req.io.in(req.params.id).emit("update");
  res.send({
    message: message,
    state: currentGame.export(userID)
  });
});

/* PUT: Allows the owner to start the game.
 * Serves the gamestate to the owner and all others in the game.
 */
router.put("/:id/start", (req, res, next) => {
  let currentGame = activeGames.get(req.params.id);
  let userID = req.user._id;
  let message;
  if (
    currentGame &&
    JSON.stringify(userID) === JSON.stringify(currentGame.state.owner)
  ) {
    currentGame.start();
    message = "Game started";
    res.send({
      message: message,
      state: currentGame.export(userID)
    });
    req.io.in(req.params.id).emit("update");
    res.sendStatus(200);
  } else {
    res.status = 403;
    message = "Only the owner can start the game";
    res.send({
      message: message,
      state: currentGame.export(userID)
    });
  }
});

/* GET: serves the user the current gamestate.
 * Sends a message if the user is not in the game, or an alert.
 */
router.get("/:id", (req, res, next) => {
  let currentGame = activeGames.get(req.params.id);
  let userID = req.user._id;
  let message, state;
  if (currentGame) {
    state = currentGame.export(userID);
    if (!currentGame.state.players.includes(currentGame.getPlayer(userID))) {
      message = "You are not in this game.";
    }
    res.send({
      message: message,
      state: state
    });
  } else {
    res.send({ alert: "No game found" });
  }
});

/* PUT: route handling playing a card
 * request body must have a card object.
 * sends back a message and gamestate. Message will describes whether the play
 * was successful.
 */
router.put("/:id/play", (req, res, next) => {
  let currentGame = activeGames.get(req.params.id);
  let userID = req.user._id;
  let card = req.body.card;
  let message = currentGame.play(userID, card);
  req.io.in(req.params.id).emit("update");
  res.send({ alert: message });
});

router.get("/:id/hand", (req, res, next) => {
  let currentGame = activeGames.get(req.params.id);
  let userID = req.user._id; //placeholder because we don't know how cookies work
  let hand = currentGame.getPlayer(userID).hand;
  console.log(
    currentGame.getPlayer(userID).username + " retrieved their hand."
  );
  res.send({ hand: hand });
});

/* PUT: route handling playing a card
 * request body must have a card object.sends back a message and gamestate.
 * Message will describes whether the bet was succesful.
 */
router.put("/:id/bet", (req, res, next) => {
  let currentGame = activeGames.get(req.params.id);
  let userID = req.user._id;
  let betAmount = req.body.bet;
  let message = currentGame.bet(userID, +betAmount);
  if (currentGame) {
    let response = {
      message: message,
      state: currentGame.export(userID)
    };
    req.io.in(req.params.id).emit("update");
    res.send({ alert: message });
  } else {
    res.send({ alert: "No game found" });
  }
});

module.exports = router;
