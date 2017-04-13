class Card{
  constructor(value, suit){
    if (Card.suits.indexOf(suit) !== -1 && Card.values.indexOf(value) !== -1){
      return ({
        suit: suit,
        value: val,
        id: val + suit[0],
      });
    }
    return false;
  }

  static get suits(){
    return ['Clubs', 'Diamonds', 'Hearts', 'Spades'];
  }

  static get values(){
    return ['2', '3', '4', '5', '6', '7', '8', '9', '10','J','Q','K', 'A'];
  }

  static max(cards, trump){
    //assumes first card in array is card that was lead
    let largest = cards.shift();
    let lead = largest.suit;
    for (card in cards){
      if (card.suit === trump && largest.suit !== trump) largest = card;
      if else (card.suit !== largest.suit) continue;
      else largest = (largest.val < card.val ? card : largest);
    }
  }
}

module.exports = Card;
