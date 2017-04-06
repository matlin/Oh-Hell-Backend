// class game initialises and handles the game for Oh-Hell
//extends admin

//get the deck from the deck class
//import deck from './deck.js';
const Deck = require('./mattsdeck.js');
const Player = require('./player.js');

//game class
class Game {
  constructor(id, minPlayers, maxPlayers){
    this.gameID = id;
    this.minPlayers = minPlayers;
    this.maxPlayers = maxPlayers;
    this.players = [];
    this.gameDeck = [];
    this.waitingForPlayers = 0;
    this.mode = 0;
    this.dealer;
    this.turn;
    this.currentTrick = [];
    this.trumpCard;
    this.round = 1;
    this.maxRound = 0;
  }

  // methods

  addPlayer(id){
    if (this.players.length < this.maxPlayers-1){
      this.players.push(new Player(id));
      this.maxRound = Math.floor(51/this.players.length);
    }
  }

  //dealer function deals the card_suits
  dealRound(){
    this.gameDeck = new Deck();
    this.gameDeck.shuffle();
    this.players.forEach((player) => {player.hand = this.gameDeck.deal(this.round)})
  }


}

//TESTING CODE

let newGame = new Game("1", 0, 4);
newGame.addPlayer("Phil");
newGame.addPlayer("Matt");
newGame.addPlayer("Jack");
newGame.addPlayer("Kevin");
newGame.dealRound();
console.log(newGame);
