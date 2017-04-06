// class game initialises and handles the game for Oh-Hell
//extends admin

import deck from './deck.js';

//game class
class game {
  constructor(){
    this.players = [];
    this.deck = [];
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
  this.deck = new deck;
  this.deck.build;
  this.deck.shuffle;
  console.log(this.deck);
}

deal();
}
