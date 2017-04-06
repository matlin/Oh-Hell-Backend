class Deck{

  constructor(){
    this.resetDeck();
  }

  resetDeck(){
    this.cards = this.createDeck();
    this.dealer = this.createDealer(this.cards);
    /*this.dealer = {
    *[Symbol.iterator]() {
        let pre = 0, cur = 1
        for  {
            [ pre, cur ] = [ cur, pre + cur ]
            yield cur
        }
    }*/
  }

  shuffle(){
    let a = this.cards;
    for (let i = a.length; i; i--) {
      let j = Math.floor(Math.random() * i);
      [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
  }

  deal(n){
    for (let i=0; i<n; i++){
      const card = this.dealer.next();
      return card.value;
    }
  }

  * createDealer(cards){
    for (let i=0; i<52; i++){
      yield cards.pop();
    }
  }

  createDeck(){
    let deck = [];
    const suits = ['clubs', 'diamonds', 'hearts', 'spades'];
    const vals = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10','J','Q','K'];
    for (let suit of suits){
      for (let val of vals){
        deck.push({
          suit: suit,
          value: val,
        });
      }
    }
    return deck;
  }
}

let deck = new Deck();
for (let i=0; i<52; i++){
  if (i===14){
    deck.resetDeck();
  }
  console.log(deck.deal(1));
}
