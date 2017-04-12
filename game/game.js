const Deck = require('./mattsdeck.js');
const Player = require('./player.js');

class Game{
  constructor(){
    //all the info that should be used to create a game
    this.state = {
      players: [],
      started: false,
      round: 0,
      numRounds: 0,
      turn: 0,
      minPlayers: 2,
      maxPlayers: 10,
      invitations: [],
      maxHandSize: 0,
      //trumpCard
      //dealer
      //bets
      //scores
      //deck
      //cards in hand
    };
  }

  //used to let players join before game starts
  //TODO enforce only allowing joining before game starts
  addPlayer(userID){
    if(this.state.players.length < this.state.maxPlayers && !this.state.started){
      let player = new Player(userID);
      this.state.players.push(player);
      if (this.state.players.length === this.state.maxPlayers){
        this.start();
      }
      return player;
    }else{
      if(this.state.started){
        return "Unable to join game. The game has already started.";
      }
      return "Unable to join game. Exceded maximum number of players.";
    }
  }

  //transitions the game into the playing state
  start(){
    this.state.maxHandSize = Math.floor(51/this.state.players.length);
    this.state.numRounds = this.state.maxHandSize * 2 - 1;
    this.state.deck = new Deck();
    this.state.round = this.Round();
    this.state.started = true;
    this.play();
  }

  //all plays must be associated with a player to enforcce turns
  play(player, cardID){
    if (player && cardID){
      this.state.round.next({player, cardID});
    }else{
      this.state.round.next();
    }
  }

  deal(numCards){
    this.state.deck.reset();
    this.state.deck.shuffle();
    for (let player of this.state.players){
      player.hand = this.state.deck.deal(numCards);
    }
  }
  //a generator that controls the rounds and turns
  //TODO add tricks and number of cards
  * Round(){
      console.log("Starting game");
      for (let round=1; round<=this.state.numRounds; round++){
        console.log("Starting round " + round);
        const numCards = round <= this.state.maxHandSize ? round : (this.state.maxHandSize - (round % this.state.maxHandSize));
        console.log("Dealing " + numCards);
        this.deal(numCards);
        for (let trick= 1; trick<=numCards; trick++ ){
          for (let player of this.state.players){
            console.log(`It's ${player._id}'s turn.`);
            /*let input = {
              player:"",
              card:""
            };*/
            let input;
            let card;
            while ((input = yield).player !== player || !(card = player.play(input.cardID))){
              if (input.player !== player){
                console.log(`Sorry it's ${player._id}'s turn`);
              }else{
                console.log('You dont have that card');
              }
            }
            console.log(card);
            console.log(`${player._id} played ${card.value} of ${card.suit}`);
          }
        }
      }
      console.log("Game over!");
  }

}

module.exports = Game;

/* Testing Code */
//create instanace of game but don't start playing
//optionally pass in num players expected (try saying `new Game(2)`);
//if the number of players added reaches the minimum needed they game will
//automatically start
/*
let game = new Game();
game.addPlayer('Jon');
game.addPlayer('Sarah');
game.start(); //starts with Jon's turn
game.play('Sarah', "5 of Diamonds"); //shouldn't be allowed to play out of turn
game.play('Jon', "Ace of Clubs"); //Jon now places 5
*/

let game = new Game();
let ben = game.addPlayer('ben');
let matt = game.addPlayer('matt');
game.start();
//console.log(game);
console.log(ben.hand);
console.log(matt.hand);
game.play(matt, "5K");
game.play(ben, "AH");
//game.play(ben, "5 of clubs");
//game.play(matt, "10 of hearts");
