class Deck{

  constructor() {
    this.reset();
  }

  reset() {
    this.cards = this.createDeck();
    this.dealer = this.createDealer(this.cards);
  }

  shuffle() {
    let a = this.cards;
    for (let i = a.length; i; i--) {
      let j = Math.floor(Math.random() * i);
      [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
  }

  deal(n) {
    let hand = [];
    for (let i=0; i<n; i++){
      const card = this.dealer.next();
      hand.push(card.value);
    }
    return hand;
  }

  * createDealer(cards) {
    for (let i=0; i<52; i++){
      yield cards.pop();
    }
  }

  createDeck() {
    let deck = [];
    const suits = ['Clubs', 'Diamonds', 'Hearts', 'Spades'];
    const vals = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10','J','Q','K'];
    for (let suit of suits){
      for (let val of vals){
        deck.push({
          suit: suit,
          value: val,
          id: val + suit[0],
        });
      }
    }
    return deck;
  }
}

module.exports = Deck;
