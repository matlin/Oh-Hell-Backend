// class game initialises and handles the game for Oh-Hell
//extends admin

//get the deck from the deck class
//import deck from './deck.js';
const deck = require('./mattsdeck.js');
//game class
class game {
  constructor(){
    this.players = [];
    this.gameDeck = [];
    this.waitingForPlayers = 0;
    this.mode = 0;
    this.dealer;
    this.turn;
    this.currentTrick = [];
    this.trumpCard;
    this.round = 0;
  }

  // methods


  //dealer function deals the card_suits
  deal(){
    this.gameDeck = new deck();
    this.gameDeck.shuffle();
    console.log(this.gameDeck);
  }


}

//TESTING CODE

let newGame = new game();
newGame.deal();
