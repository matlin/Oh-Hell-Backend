const Deck = require('./deck.js');
const Player = require('./player.js');
const Card = require('./card.js');

class Game{
  constructor(id){
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
      tricks: new Map(),
      id: id,
    };
  }

  export(user){
    let exportedState = {};
    exportedState.players = this.state.players.map(player => player.username);
    exportedState.started = this.state.started;
    exportedState.scores = this.state.scores;
    exportedState.cardsInPlay = {};
    this.state.cardsInPlay.forEach((card, player) => {
      exportedState.cardsInPlay[player.username] = card;
    });
    exportedState.dealer = this.state.dealer ? this.state.dealer.username : null;
    exportedState.trumpCard = this.state.trumpCard;
    exportedState.tricks = {};
    this.state.tricks.forEach((card, player) => {
      exportedState.tricks[player.username] = card;
    });
    exportedState.bets = {};
    for (let userID in this.state.bets){
      exportedState.bets[this.getPlayer(userID).username] = this.state.bets[userID];
    }
    exportedState.turn = this.state.turn ? this.state.turn.username : null;
    exportedState.round = this.state.round;
    exportedState.id = this.state.id;
    let player = this.getPlayer(user)
    if (player){
      exportedState.hand = player.hand;
    }
    if (user === 'db'){
      //add what is needed to save as JSON to database
    }
    return JSON.stringify(exportedState);
  }

  //used to let players join before game starts
  addPlayer(userID, username){
    let message;
    if(this.state.players.length < this.state.maxPlayers && !this.state.started){
      let player = new Player(userID, username);
      this.state.players.push(player);
      if (this.state.players.length === this.state.maxPlayers){
        this.start();
      }
      message = `${username} joined game.`;
      return player;
    }else{
      if(this.state.started){
        message = "Unable to join game. The game has already started.";
      }
      message = "Unable to join game. Exceded maximum number of players.";
    }
    console.log(message);
    return message;
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

  getPlayer(id){
    for(let player of this.state.players){
      if (player.id === id){
        return player;
      }
    }
    return false;
  }

  //all plays must be associated with a player to enforcce turns
  play(player, cardID){
    let message;
    if (player && cardID){
      let card;
      //so function can accept id string or player object
      if (!(player instanceof Player)){
        player = this.getPlayer(player);
      }
      if(!this.state.betting && player === this.state.turn && (card = player.play(cardID))){
        message = `${player.username} played ${card.value} of ${card.suit}`;
        this.state.cardsInPlay.set(player.id, card);
        this.state.roundHandler.next();
      }else{
        if (player !== this.state.turn){
          message = `Sorry it's ${this.state.turn.username}'s turn to play`;
        }else if (this.state.betting){
          message = 'The game is only accepting bets at this time';
        }else{
          message = 'You can not play that.';
        }
      }
    }else{
      message = "Either play or cardID was not provided";
    }
    console.log(message);
    return message;
  }

  //TODO add betting and rule for last person to betting
  bet(player, bet){
    let message;
    if (player != null && bet != null){
        if (!(player instanceof Player)){
          player = this.getPlayer(player);
        }
        if(player === this.state.turn && bet <= this.state.handSize && bet >= 0 && Number.isInteger(bet) && this.state.betting){
          this.state.bets[player.id] = bet;
          this.state.roundHandler.next();
          message = "Bet made succesfully";
        }else{
          if (player !== this.state.turn){
            message = `Sorry it's ${this.state.turn.username}'s turn to bet`;
          }else{
            message = 'That is not a valid bet';
          }
        }
    }
    console.log(message);
    return message;
  }

  deal(numCards){
    this.state.deck.reset();
    this.state.deck.shuffle();
    for (let player of this.state.players){
      player.hand = this.state.deck.deal(numCards);
    }
    this.state.trumpCard = this.state.deck.deal(1)[0];
  }

  // getPlayerState(userID){
  //
  // }


  //a generator that controls the rounds and turns

  //TODO this function is getting out of hand and needs to be broken up some how
  //     I'm thinking that checking a players turn needs to be it's own function

  // functions to define elsewhere to make round shorter
  // getBets -> after all bets have been gathered should allow people to play tricks
  // playTrick --> should go through each player to get 1 card, at end should call function to check: checkTrickWin
  // --> should assign scores, or call function to assign scores: getScores
  // --> after a single trick has been played we should continuously play tricks and assign scores until there are no more cards

  * GameHandler(){
      let handler = RoundHandler();
      yield;
      let round = handler.next();
      while(!round.done){
        yield;
        round = handler.next();
      }
  }

  * DealerHandler(){
      let i = Math.floor(Math.random() * this.state.players.length);
      while(true){
        yield this.state.players[i % this.state.players.length].id;
        i++;
      }
  }

  * RoundHandler(){
      console.log("Starting game");
      const dealerHandler = this.DealerHandler();
      for (this.state.round=1; this.state.round<=this.state.numRounds; this.state.round++){
        let round = this.state.round;
        console.log("#### STARTING ROUND " + round);
        const numCards = round <= this.state.maxHandSize ? round : (this.state.maxHandSize - (round % this.state.maxHandSize));
        this.state.handSize = numCards;
        this.state.dealer = dealerHandler.next().value;
        console.log(`## DEALER: ${this.getPlayer(this.state.dealer).username} `);
        console.log("## DEALING OUT: " + numCards);
        this.deal(numCards);
        console.log(`## TRUMP CARD IS ${this.state.trumpCard.value} of ${this.state.trumpCard.suit}`);
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
        console.log('Round tricks', this.state.tricks);
        this.updateScores();
        console.log('score', this.state.scores);
        this.state.tricks.clear();
        //check who wins that round
      }
      console.log("Game over");
  }
  //needs to start with left of the dealer
  * BetHandler(){
      const offset = this.state.players.findIndex(player => player.id === this.state.dealer);
      for (let i=1; i<=this.state.players.length; i++){
        let player = this.state.players[(i+offset) % this.state.players.length];
        this.state.turn = player;
        console.log(`${player.username}'s turn to bet`);
        yield;
        console.log(`${player.username} bet ${this.state.bets[player.id]}`);
      }
  }

  * TrickHandler(numCards){
      const offset = this.state.players.findIndex(player => player.id === this.state.dealer);
      for (let trick= 1; trick<=numCards; trick++ ){
        console.log(`Playing trick ${trick} of ${numCards}`);
        for (let i=1; i<=this.state.players.length; i++){
          let player = this.state.players[(i+offset) % this.state.players.length];
          this.state.turn = player;
          console.log(`${player.username}'s turn to play`);
          yield;
          let card = this.state.cardsInPlay.get(player.id);
          console.log(`${player.username} played ${card.value} of ${card.suit}`);
        }
        const winnerID = this.getTrickWinner();
        const winningCard = this.state.cardsInPlay.get(winnerID);
        console.log(`${this.getPlayer(winnerID).username} won with ${winningCard.value} of ${winningCard.suit} wins`);
        const winnerTricks = this.state.tricks.has(winnerID) ? this.state.tricks.get(winnerID) : 0;
        this.state.tricks.set(winnerID, winnerTricks + 1);
        this.state.cardsInPlay.clear();
      }
  }

  getTrickWinner(){
    const winningCard = Card.max(Array.from(this.state.cardsInPlay.values()), this.state.trumpCard.suit);
    let winner;
    for (let entry of this.state.cardsInPlay.entries()){
      if (entry[1] === winningCard){
        winner = entry[0];
      }
    }
    return winner;
  }

  updateScores(){
    for (let playerID in this.state.bets){
      //create round in score if doesn't exist
      if(!this.state.scores.round[this.state.round]){
        this.state.scores.round[this.state.round] = {};
      }
      //reward points for meeting contract or 0 for not
      if (this.state.bets[playerID] === this.state.tricks.get(playerID)){
          this.state.scores.round[this.state.round][playerID] = 10 + 2*this.state.tricks.get(playerID);
      } else {
        this.state.scores.round[this.state.round][playerID] = 0;
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

/*
let game = new Game();
let ben = game.addPlayer('ben');
let matt = game.addPlayer('matt');
let phil = game.addPlayer('phil');
let josh = game.addPlayer('josh');
let ben1 = game.addPlayer('ben1');
let matt1 = game.addPlayer('matt1');
let phil1 = game.addPlayer('phil1');
let josh1 = game.addPlayer('josh1');
game.start();
//console.log(game);
game.bet(game.state.turn, 1);
game.bet(game.state.turn, 1);
game.play(game.state.turn, game.state.turn.hand[0].id);
game.play(game.state.turn, game.state.turn.hand[0].id);
*/
// game.bet(game.state.turn, 1);
// game.bet(game.state.turn, 1);
// game.play(game.state.turn, game.state.turn.hand[0].id);
// game.play(game.state.turn, game.state.turn.hand[0].id);
// game.bet(game.state.turn, 1);
// game.bet(game.state.turn, 1);
// //console.log(matt.hand);
// //console.log(ben.hand);
// game.play(game.state.turn, game.state.turn.hand[0].id);
// game.play(game.state.turn, game.state.turn.hand[0].id);
// console.log(game.state.cardsInPlay.size);
// console.log(matt.hand);
// console.log(ben.hand);
// game.play(game.state.turn, game.state.turn.hand[0].id);
// game.play(game.state.turn, game.state.turn.hand[0].id);

// for (let i=1; i<=game.state.numRounds; i++){
//   const bet = i % game.state.maxHandSize;
//   game.bet(game.state.turn, bet);
//   game.bet(game.state.turn, bet);
//   for (let j=0; j<i; j++){
//     for (let k=0; k<game.state.players.length; k++){
//       let player = game.state.turn;
//       let card = game.state.turn.hand[0];
//       game.play(player, card.id);
//     }
//   }
// }

let game = new Game();
let noel = game.addPlayer(1, 'noel');
let matt = game.addPlayer(2, 'matt');
game.start();
console.log(game.export(1));
