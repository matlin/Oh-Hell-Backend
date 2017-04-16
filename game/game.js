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
      scores: {round:{}},
      bets:{},
      handSize:0,
      //lastToBet
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
    this.state.roundHandler = this.RoundHandler();
    this.state.started = true;
    this.state.roundHandler.next();
  }

  //all plays must be associated with a player to enforcce turns
  play(player, cardID){
    if (player && cardID){
      let card;
      if(!this.state.betting && player === this.state.turn && (card = player.play(cardID))){
        this.state.cardsInPlay.set(player, card);
        this.state.roundHandler.next();
      }else{
        if (player !== this.state.turn){
          console.log(`Sorry it's ${this.state.turn.id}'s turn to play`);
        }else if (this.state.betting){
          console.log('The game is only accepting bets at this time');
        }else{
          console.log('You can not play that.')
        }
      }
    }
  }

  //TODO add betting and rule for last person to betting
  bet(player, bet){
    if (player && bet){
        if(player === this.state.turn && bet <= this.state.handSize && bet > 0 && Number.isInteger(bet) && this.state.betting){
          this.state.bets[player.id] = bet;
          this.state.roundHandler.next();
        }else{
          if (player !== this.state.turn){
            console.log(`Sorry it's ${this.state.turn.id}'s turn to bet`);
          }else{
            console.log('That is not a valid bet');
          }
        }
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

  //TODO this function is getting out of hand and needs to be broken up some how
  //     I'm thinking that checking a players turn needs to be it's own function

  // functions to define elsewhere to make round shorter
  // getBets -> after all bets have been gathered should allow people to play tricks
  // playTrick --> should go through each player to get 1 card, at end should call function to check: checkTrickWin
  // --> should assign scores, or call function to assign scores: getScores
  // --> after a single trick has been played we should continuously play tricks and assign scores until there are no more cards

  * GameHandler(){
      console.log("Starting game");
      let handler = RoundHandler();
      yield;
      let round = handler.next();
      while(!round.done){
        yield;
        round = handler.next();
      }
      console.log("Game over!");
  }

  * RoundHandler(){
      for (this.state.round=1; this.state.round<=this.state.numRounds; this.state.round++){
        let round = this.state.round;
        console.log("Starting round " + round);
        const numCards = round <= this.state.maxHandSize ? round : (this.state.maxHandSize - (round % this.state.maxHandSize));
        this.state.handSize = numCards;
        console.log("Dealing " + numCards);
        this.deal(numCards);
        this.state.dealer = this.state.players[Math.floor(Math.random() * this.state.players.length)];
        console.log(`${this.state.dealer.id} is dealer`);
        this.state.betting = true;
        let betting = this.BetHandler();
        //yield;
        let bet = betting.next();
        while(!bet.done){
          yield;
          bet = betting.next();
        }
        this.state.betting = false;
        let tricks = this.TrickHandler(numCards);
        let trick = tricks.next();
        while(!trick.done){
          yield;
          trick = tricks.next();
        }
        //check who wins that round
      }
      console.log("Game over");
  }
  //needs to start with left of the dealer
  * BetHandler(){
      const offset = this.state.players.findIndex(player => player === this.state.dealer);
      for (let i=0; i<this.state.players.length; i++){
        let player = this.state.players[(i+offset) % this.state.players.length];
        this.state.turn = player;
        console.log(`${player.id}'s turn to bet`);
        yield;
        console.log(`${player.id} bet ${this.state.bets[player.id]}`);
      }
  }
  * TrickHandler(numCards){
      const offset = this.state.players.findIndex(player => player === this.state.dealer);
      for (let trick= 1; trick<=numCards; trick++ ){
        for (let i=0; i<this.state.players.length; i++){
          let player = this.state.players[(i+offset) % this.state.players.length];
          this.state.turn = player;
          console.log(`${player.id}'s turn to play`);
          yield;
          let card = this.state.cardsInPlay.get(player);
          console.log(`${player.id} played ${card.value} of ${card.suit}`);
        }
        //check who wins that trick
      }
  }

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

  updateScores(){
    for (let playerID in this.state.bets){
      //create round in score if doesn't exist
      if(!this.state.scores.round[this.state.round]){
        this.state.scores.round[this.state.round] = {};
      }
      //reward points for meeting contract or 0 for not
      if (this.state.bets[playerID] === this.state.tricks[playerID]){
          this.state.scores.round[this.state.round][playerID] = 10 + 2*this.state.tricks[playerID];
      } else {
        this.state.scores.round[playerID] = 0;
      }
    }
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
game.bet(game.state.turn, 1);
game.bet(game.state.turn, 1);
game.play(game.state.turn, game.state.turn.hand[0].id);
game.play(game.state.turn, game.state.turn.hand[0].id);
