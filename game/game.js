const Deck = require('./deck.js');
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

  bet(player, bet){
    if (player && bet){
      this.state.round.next({player, bet});
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

  // getPlayerState(userID){
  //
  // }


  //a generator that controls the rounds and turns
  //TODO add betting and rule for last person to betting
  //TODO this function is getting out of hand and needs to be broken up some how
  //     I'm thinking that checking a players turn needs to be it's own function

  // functions to define elsewhere to make round shorter
  // getBets -> after all bets have been gathered should allow people to play tricks
  // playTrick --> should go through each player to get 1 card, at end should call function to check: checkTrickWin
  // --> should assign scores, or call function to assign scores: getScores
  // --> after a single trick has been played we should continuously play tricks and assign scores until there are no more cards

  * Round(){
      console.log("Starting game");
      for (let round=1; round<=this.state.numRounds; round++){
        console.log("Starting round " + round);
        const numCards = round <= this.state.maxHandSize ? round : (this.state.maxHandSize - (round % this.state.maxHandSize));
        console.log("Dealing " + numCards);
        this.deal(numCards);
        //get bets from players
        for (let player of this.state.players){
          let input;
          while((input = yield).player !== player || input.bet > numCards || input.bet < 0 || !Number.isInteger(input.bet)){
            if (input.player !== player){
              console.log(`Sorry it's ${player._id}'s turn to bet`);
            }else{
              console.log('That is not a valid bet');
            }
          }
          console.log(`${player._id} bet ${input.bet}`);
        }
        for (let trick= 1; trick<=numCards; trick++ ){
          for (let player of this.state.players){
            console.log(`It's ${player._id}'s turn.`);
            let input, card;
            //yield should contain an object containing an instance of player and a cardID
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

  // getBets
  // cyce through every player and allow them to choose a number of bets
  //should not be able to bet more than # cards in hand
  //minimum bet should be 0
  //everyone must make a bet, in order

  // checkTrickWin
  // check if everyone has played?
  // look through the array of cards played for this trick
  // if suit matches trump card then this takes precidence and max val in this suit wins
  // otherwise the max value card wins
  // if there are 2 identical cards then higher value suit wins?
  // when we've cycled through the cards in the trick give the player who's card it was the appropritate scores
  // official score is assigned at end of round so this should be used to help us keep track of each player's tricks won

// scores
// for each player check how many tricks they've won and compare to their between
// assign a score based on this comparison
// best score if tricksWon === bets the player made



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
