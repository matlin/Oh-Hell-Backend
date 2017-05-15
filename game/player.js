//player class to be used to play the game

class Player {
  constructor(id, username) {
    this._id = id;
    this._hand = [];
    this._username = username;
    this._suits = [];
    this._firstSuit = null;
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

  get hasSuit(){
    let has = false;
    for(let i = 0; i < this._hand.length; i++){
      if(this._hand[i].suit === this._firstSuit){
        has = true;
    }
    return has;
  }

  get firstSuit(suit){
    return this._firstSuit = suit;
  }


  //checks that the player has the card and removes it
 play(cardID) {
   let check = hasSuit();
   for (let card of this._hand) {
       if (cardID === card.id) {
          if(card.suit === this._firstSuit || check === false){
             const result = this._hand.splice(
             this._hand.findIndex(element => element === card),
              1
           )[0];
           return result;
         }
       }
     }
     return false;
   }
}

module.exports = Player;
