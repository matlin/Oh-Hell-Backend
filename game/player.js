//player class to be used to play the game

class Player {

  constructor(id){
    this._id = id;
    this._hand = [];
    this._bet;
    this._tricksWon = 0;
    this._score = 0;
  }

  set bet(bet) {this._bet = bet}
  get bet() {return this._bet}
  set hand(cards) {this._hand = cards}
  get hand() {return this._hand}

  addTrick(){
    this.tricksWon++;
  }

  addScore(){
    if (this._tricksWon === this._bet)
      this._score += (10 + 2*(this._tricksWon));
  }

  popCard(index){
    let card = this.hand[index];
    this.hand.splice(index);
    return card;
  }

}

module.exports = Player;
