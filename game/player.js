//player class to be used to play the game

class Player {
  constructor(id, username) {
    this._id = id;
    this._hand = [];
    this._username = username;
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

  hasSuit(suit) {
    for (let card of this._hand) {
      if (card.suit === suit) {
        return true;
      }
    }
    return false;
  }

  //checks that the player has the card and removes it
  play(cardID, requiredSuit) {
    for (let card of this._hand) {
      if (cardID === card.id) {
        const restricted = this.hasSuit(requiredSuit);
        if (
          requiredSuit == null ||
          (requiredSuit &&
            (!restricted ||
              (restricted &&
                cardID.slice(-1).toLowerCase() ===
                  requiredSuit[0].toLowerCase())))
        ) {
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
