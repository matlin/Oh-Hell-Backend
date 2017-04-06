// class game initialises and handles the game for Oh-Hell
//extends admin

const Deck = require('./mattsdeck.js');
const Player = require('./player.js');

//game class
class Game {
  constructor(id, minPlayers, maxPlayers){
    // game-level
    this.gameID = id;
    this.minPlayers = minPlayers;
    this.maxPlayers = maxPlayers;
    this.waitingForPlayers = 0;
    this.players = [];
    this.mode = 0;

    // hand-level
    this.dealer;

    this.gameDeck = [];
    this.trumpCard = {suit:'diamonds',value:2};
    this.round = 1;
    this.maxRound = 0;

    // trick-level
    this.leadOff = 3; //index of starting player
    this.currentTrick = [{suit:'hearts',value:2},{suit:'clubs',value:10},{suit:'diamonds',value:3},{suit:'clubs',value: 5},]; //testing code
    this.turn;
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
  // will increment the tricksWon attribute of the player that wins the trick
  trickEnd(){
    let winningCard = this.currentTrick[0];
    let winningIndex = 0;
    let starterSuit = this.currentTrick[0].suit;

    for (let i = 1 ; i < this.currentTrick.length; i++){
      if ((winningCard.suit == this.trumpCard.suit && this.currentTrick[i].suit == this.trumpCard.suit)||(winningCard.suit == starterSuit && this.currentTrick[i] == starterSuit)){
        console.log("same suit");
        if(winningCard.value > this.currentTrick[i]){
          winningCard = this.currentTrick[i];
          winningIndex = i;
        }
      } else if (this.currentTrick[i].suit == this.trumpCard.suit && winningCard.suit != this.trumpCard.suit){
        console.log("trumped");
        winningCard = this.currentTrick[i];
        winningIndex = i;
      }
    }
    let winningPlayerIndex = (winningIndex + this.leadOff) % this.players.length;
    this.players[winningPlayerIndex].addTrick();
    console.log("winning index:", winningIndex);
    console.log("winning player index", winningPlayerIndex);
  }
}

//TESTING CODE

let newGame = new Game("1", 0, 4);
newGame.addPlayer("Phil");
newGame.addPlayer("Matt");
newGame.addPlayer("Jack");
newGame.addPlayer("Kevin");
newGame.trickEnd();
//console.log(newGame);
