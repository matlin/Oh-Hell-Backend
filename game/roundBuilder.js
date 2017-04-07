class Game{
  constructor(numPlayers = 8){
    this.players = [];
    this.numPlayers = numPlayers;
  }

  //used to let players join before game starts
  //TODO enforce only allowing joining before game starts
  addPlayer(player){
    this.players.push(player);
    if (this.players.length === this.numPlayers){
      this.start();
    }
  }
  //transitions the game into the playing state
  start(){
    this.round = this.Round(this.players);
    this.play();
  }

  //all plays must be associated with a player to enforcce turns
  play(player, card){
    if (player && card){
      this.round.next({player, card});
    }else{
      this.round.next();
    }
  }
  //a generator that controls the rounds and turns
  //TODO add tricks and number of cards
  * Round(players = [], numRounds = 3){
      console.log("Starting game");
      for (let i=1; i<=numRounds; i++){
        console.log("Starting round " + i);
        for (let player of players){
          console.log(`It's ${player}'s turn.`);
          let input = {
            player:"",
            card:""
          };
          while ((input = yield).player !== player){
            console.log(`Sorry it's ${player}'s turn`);
          }
            console.log(`${player} played ${input.card}`);
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
let game = new Game();
game.addPlayer('Jon');
game.addPlayer('Sarah');
game.start(); //starts with Jon's turn
game.play('Sarah', 5); //shouldn't be allowed to play out of turn
game.play('Jon', 5); //Jon now places 5 
