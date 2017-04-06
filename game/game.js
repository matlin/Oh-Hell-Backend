// class game initialises and handles the game for Oh-Hell
//extends admin

//get the deck from the deck class
//import deck from './deck.js';
const Deck = require('./mattsdeck.js');
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
    this.round = 0;
    this.maxRound = 0;
  }

  // methods

  addPlayer(id){
    if (players.length < maxPlayers-1){
      this.players.push(new Player(id));
      this.maxRound = Math.floor(51/this.players.length);
    }
  }

  //dealer function deals the card_suits
  dealRound(){
    this.gameDeck = new Deck();
    this.gameDeck.shuffle();
    thisplayer.foreach((player) => player.setHand(gameDeck.deal(round)))
  }


}

//TESTING CODE

let newGame = new game();
newGame.dealRound();
