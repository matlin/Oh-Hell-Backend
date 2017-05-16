const Deck = require("./deck.js");
const Player = require("./player.js");
const Card = require("./card.js");

class Game {
  constructor(id, owner, gameName, password) {
    //all the info that should be used to create a game
    this.state = {
      players: [],
      started: false,
      round: 0,
      numRounds: 0,
      turn: null,
      minPlayers: 2,
      maxPlayers: 10,
      invitations: [],
      maxHandSize: 0,
      cardsInPlay: new Map(), //map to guarantee property order
      betting: false,
      dealer: null,
      trumpCard: null,
      deck: null,
      scores: { round: {} },
      bets: {},
      handSize: 0,
      tricks: new Map(),
      id: id,
      gameName: gameName,
      password: password,
      owner: owner,
      messages: []
    };
  }

  //takes a userID of a player or 'db' to singnify who the state is for
  export(user) {
    let exportedState = {};
    exportedState.players = this.state.players.map(player => player.username);
    exportedState.started = this.state.started;
    exportedState.betting = this.state.betting;
    exportedState.scores = {};
    exportedState.scores.round = {};
    for (let round in this.state.scores.round){
      exportedState.scores.round[round] = {};
      for (let playerID in this.state.scores.round[round]){
        const player = this.getPlayer(playerID);
        exportedState.scores.round[round][player.username] = this.state.scores.round[round][playerID];
      }
    }
    exportedState.cardsInPlay = {};
    this.state.cardsInPlay.forEach((card, player) => {
      exportedState.cardsInPlay[this.getPlayer(player).username] = card;
    });
    exportedState.dealer = this.getPlayer(this.state.dealer).username;
    exportedState.trumpCard = this.state.trumpCard;
    exportedState.tricks = {};
    this.state.tricks.forEach((tricks, player) => {
      exportedState.tricks[this.getPlayer(player).username] = tricks;
    });
    exportedState.bets = {};
    for (let userID in this.state.bets) {
      exportedState.bets[this.getPlayer(userID).username] = this.state.bets[
        userID
      ];
    }
    exportedState.turn = this.state.turn ? this.state.turn.username : null;
    exportedState.round = this.state.round;
    exportedState.id = this.state.id;
    exportedState.gameName = this.state.gameName;
    exportedState.hasPassword = this.state.password != null;
    exportedState.maxPlayers = this.state.maxPlayers;
    exportedState.minPlayers = this.state.minPlayers;
    let player = this.getPlayer(user);
    exportedState.isOwner = this.state.owner === player._id;
    if (player) {
      exportedState.hand = player.hand;
      exportedState.user = player.username;
      exportedState.joined = true;
    } else {
      exportedState.joined = false;
    }
    if (user === "db") {
      //add what is needed to save as JSON to database
    }
    exportedState.messages = this.state.messages;
    return exportedState;
  }

  //used to let players join before game starts
  addPlayer(userID, username) {
    let message;
    if (
      this.state.players.length < this.state.maxPlayers && !this.state.started
    ) {
      let player = new Player(userID, username);
      this.state.players.push(player);
      if (this.state.players.length === this.state.maxPlayers) {
        this.start();
      }
      message = `${username} joined game.`;
      this.state.messages.push(message);
    } else {
      if (this.state.started) {
        message = "Unable to join game. The game has already started.";
        this.state.messages.push(message);
      }
      message = "Unable to join game. Exceded maximum number of players.";
      this.state.messages.push(message);
    }
    console.log(message);
    return message;
  }

  //transitions the game into the playing state
  start() {
    this.state.maxHandSize = Math.floor(51 / this.state.players.length);
    this.state.numRounds = this.state.maxHandSize * 2 - 1;
    this.state.deck = new Deck();
    this.state.roundHandler = this.RoundHandler();
    this.state.started = true;
    this.state.roundHandler.next();
  }

  //converts a playerID/userID to player obj
  getPlayer(id) {
    for (let player of this.state.players) {
      if (JSON.stringify(player.id) === JSON.stringify(id)) {
        return player;
      }
    }
    return false;
  }

  //all plays must be associated with a player to enforcce turns
  play(player, cardID) {
    let message;
    if (player && cardID) {
      let card;
      //so function can accept id string or player object
      if (!(player instanceof Player)) {
        player = this.getPlayer(player);
      }
      if (
        !this.state.betting &&
        player === this.state.turn &&
        (card = player.play(cardID))
      ) {
        message = `${player.username} played ${card.value} of ${card.suit}`;
        this.state.messages.push(message);
        this.state.cardsInPlay.set(player.id, card);
        this.state.roundHandler.next();
      } else {
        if (player !== this.state.turn) {
          message = `Sorry it's ${this.state.turn.username}'s turn to play`;
        } else if (this.state.betting) {
          message = "The game is only accepting bets at this time";
        } else {
          message = "You can not play that.";
        }
      }
    } else {
      message = "Either play or cardID was not provided";
    }
    console.log(message);
    return message;
  }

  //TODO rule for last person to bet can't make number of bets = tricks
  bet(player, bet) {
    let message;
    if (player != null && bet != null) {
      if (!(player instanceof Player)) {
        player = this.getPlayer(player);
      }
      if (
        player === this.state.turn &&
        bet <= this.state.handSize &&
        bet >= 0 &&
        Number.isInteger(bet) &&
        this.state.betting
      ) {
        this.state.bets[player.id] = bet;
        this.state.roundHandler.next();
        message = `${player.username} bet ${bet}`;
        this.state.messages.push(message);
      } else {
        if (player !== this.state.turn) {
          message = `Sorry it's ${this.state.turn.username}'s turn to bet`;
        } else {
          message = "That is not a valid bet";
        }
      }
    }
    console.log(message);
    return message;
  }

  //resets deck and gives players numCards
  deal(numCards) {
    this.state.deck.reset();
    this.state.deck.shuffle();
    for (let player of this.state.players) {
      player.hand = this.state.deck.deal(numCards);
    }
    this.state.trumpCard = this.state.deck.deal(1)[0];
  }

  //creates rounds and plays them out
  *GameHandler() {
    let handler = RoundHandler();
    yield;
    let round = handler.next();
    while (!round.done) {
      yield;
      round = handler.next();
    }
  }

  //returns the next dealer depends on array being in the same order
  *DealerHandler() {
    let i = Math.floor(Math.random() * this.state.players.length);
    while (true) {
      yield this.state.players[i % this.state.players.length].id;
      i++;
    }
  }

  //creates rounds and plays them out
  *RoundHandler() {
    console.log("Starting game");
    const dealerHandler = this.DealerHandler();
    for (
      this.state.round = 1;
      this.state.round <= this.state.numRounds;
      this.state.round++
    ) {
      let round = this.state.round;
      console.log("#### STARTING ROUND " + round);
      const numCards = round <= this.state.maxHandSize
        ? round
        : this.state.maxHandSize - round % this.state.maxHandSize;
      this.state.handSize = numCards;
      this.state.dealer = dealerHandler.next().value;
      console.log(`## DEALER: ${this.getPlayer(this.state.dealer).username} `);
      console.log("## DEALING OUT: " + numCards);
      this.deal(numCards);
      console.log(
        `## TRUMP CARD IS ${this.state.trumpCard.value} of ${this.state.trumpCard.suit}`
      );
      this.state.betting = true;
      let betting = this.BetHandler();
      //yield;
      let bet = betting.next();
      while (!bet.done) {
        yield;
        bet = betting.next();
      }
      this.state.betting = false;
      let tricks = this.TrickHandler(numCards);
      let trick = tricks.next();
      while (!trick.done) {
        yield;
        trick = tricks.next();
      }
      console.log("Round tricks", this.state.tricks);
      this.updateScores();
      console.log("score", this.state.scores);
      this.state.tricks.clear();
      this.state.bets = {};
      //check who wins that round
    }
    console.log("Game over");
  }

  //starts betting from the next player in the array from the dealer
  *BetHandler() {
    const offset = this.state.players.findIndex(
      player => player.id === this.state.dealer
    );
    for (let i = 1; i <= this.state.players.length; i++) {
      let player = this.state.players[(i + offset) % this.state.players.length];
      this.state.turn = player;
      console.log(`${player.username}'s turn to bet`);
      yield;
      console.log(`${player.username} bet ${this.state.bets[player.id]}`);
    }
  }

  //plays out a given round and tricks
  *TrickHandler(numCards) {
    let message;
    const offset = this.state.players.findIndex(
      player => player.id === this.state.dealer
    );
    for (let trick = 1; trick <= numCards; trick++) {
      console.log(`Playing trick ${trick} of ${numCards}`);
      for (let i = 1; i <= this.state.players.length; i++) {
        let player = this.state.players[
          (i + offset) % this.state.players.length
        ];
        this.state.turn = player;
        console.log(`${player.username}'s turn to play`);
        yield;
        let card = this.state.cardsInPlay.get(player.id);
        console.log(`${player.username} played ${card.value} of ${card.suit}`);
      }
      const winnerID = this.getTrickWinner();
      const winningCard = this.state.cardsInPlay.get(winnerID);
      message = `${this.getPlayer(winnerID).username} won with ${winningCard.value} of ${winningCard.suit}`
      this.state.messages.push(message);
      console.log(
        `${this.getPlayer(winnerID).username} won with ${winningCard.value} of ${winningCard.suit}`
      );
      const winnerTricks = this.state.tricks.has(winnerID)
        ? this.state.tricks.get(winnerID)
        : 0;
      this.state.tricks.set(winnerID, winnerTricks + 1);
      this.state.cardsInPlay.clear();
    }
  }

  //takes cardsInPlay and calculates a winning card
  getTrickWinner() {
    const winningCard = Card.max(
      Array.from(this.state.cardsInPlay.values()),
      this.state.trumpCard.suit
    );
    let winner;
    for (let entry of this.state.cardsInPlay.entries()) {
      if (entry[1] === winningCard) {
        winner = entry[0];
      }
    }
    return winner;
  }

  //calculates and updates score from number of tricks won and number of bets
  updateScores() {
    for (let playerID in this.state.bets) {
      //create round in score if doesn't exist
      if (!this.state.scores.round[this.state.round]) {
        this.state.scores.round[this.state.round] = {};
      }
      //reward points for meeting contract or 0 for not
      if (this.state.bets[playerID] === this.state.tricks.get(playerID)) {
        this.state.scores.round[this.state.round][playerID] =
          10 + 2 * this.state.tricks.get(playerID);
      } else {
        this.state.scores.round[this.state.round][playerID] = 0;
      }
    }
  }
}

module.exports = Game;
