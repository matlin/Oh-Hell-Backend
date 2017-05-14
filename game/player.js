//player class to be used to play the game

class Player {
  constructor(id, username) {
    this._id = id;
    this._hand = [];
    this._username = username;
    this._suits = [];
  }

  get id() {
    return this._id;
  }
  set hand(cards) {
    this._hand = cards;
  }
  get hand() {
    return this._hand;
  }
  get username() {
    return this._username;
  }

  suits(){
    let temp = [];
    for(let i = 0; i <= this._hand.length; i++){
      // let tempCard = this._hand[i];
      // let tempSuit = tempCard.suit;
      temp.push(this._hand[i].suit);
      //this._suits.push(tempSuit);
    }
    return temp;
  }


  //checks that the player has the card and removes it
  play(cardID) {
    for (let card of this._hand) {
      if (cardID === card.id) {
        const result = this._hand.splice(
          this._hand.findIndex(element => element === card),
          1
        )[0];
        this._suits = suits();
        return result;
      }
    }
    return false;
  }
}

module.exports = Player;
