//player class to be used to play the game

class Player {

  constructor(id, username){
    this._id = id;
    this._hand = [];
    this._bet;
    this._tricksWon = 0;
    this._score = 0;
    this._username = username;
  }

  get id() {return this._id}
  set bet(bet) {this._bet = bet}
  get bet() {return this._bet}
  set hand(cards) {this._hand = cards}
  get hand() {return this._hand}
  get username() {return this._username}

  addTrick(){
    this.tricksWon++;
  }

  addScore(){
    if (this._tricksWon === this._bet)
      this._score += (10 + 2*(this._tricksWon));
  }

  play(cardID){
    for (let card of this._hand){
      if (cardID === card.id){
        const result = this._hand.splice(this._hand.findIndex(element => element === card), 1)[0];
        return result;
      }
    }
    return false;
  }

  popCard(index){
    let card = this.hand[index];
    this.hand.splice(index);
    return card;
  }

}

module.exports = Player;
