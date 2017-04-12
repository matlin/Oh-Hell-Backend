/*
  This function creates the deck of cards for a given game of Oh Hell

  Updated: 4.5.17
*/

class deck{
  constructor(){
    this.card_suits = ['clubs', 'diamonds', 'hearts', 'spades'];
    this.card_names = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10','J','Q','K'];
    this.deck = [];
  }

// card class
static Card(name, suit) {
    var card = [];
    card.push(name);
    card.push(suit);
    return card;
}

// creats deck of cards using card class
build() {
   for( var s = 0; s < this.card_suits.length; s++ ) {
       for( var n = 0; n < this.card_names.length; n++ ) {
           this.deck.push(deck.Card(this.card_names[n], this.card_suits[s]));
       }
   }
 };

// accessor class for deck
get() {
    return this.deck;
}

// pops desired number of cards
// deal() {
//     return deck.toStr(this.deck.splice(0,num_cards));
// };

// pops a single card
pop(){
    return deck.toStr(this.deck.splice(0,1));
};

// shuffles deck of cards
shuffle() {
    //modern Fisher-Yates shuffle
    var decksize = this.deck.length;
    for( var i = (decksize-1); i >= 1; i-- ) {
        //A random number between 0 and length-1
        var j = Math.floor(Math.random()*(i+1));
        var temp = this.deck[i];
        this.deck[i] = this.deck[j];
        this.deck[j] = temp;
    }
    return this.deck;
};

// prints a given deck (or hand) as a string
static toStr(deck) {
    var deckToString = deck.slice(0);
    for( var i = 0; i < deckToString.length; i++ ) {
      deckToString[i]= deckToString[i].join('-');
    }
    return deckToString.join('\n ');
};

}
//export default deck;

//TESTING CODE
var newDeal = new deck();
newDeal.build();
console.log("Full deck, in order:\n", deck.toStr(newDeal.get()));
newDeal.shuffle();
console.log("\n");
console.log("Full deck, not in order:\n", deck.toStr(newDeal.get()));
console.log("\n");
console.log("Trump card: ", newDeal.pop());
console.log("\n");
console.log("new deck", deck.toStr(newDeal.get()));
// console.log("Player 1 hand:\n", newDeal.deal(8));
// console.log("\n\n");
// console.log("Player 2 hand:\n", newDeal.deal(8));
// console.log("\n\n");
// console.log("Player 3 hand:\n", newDeal.deal(8));
// console.log("\n\n");
// console.log("Player 4 hand:\n", newDeal.deal(8));
// console.log("\n\n");
// console.log("Player 5 hand:\n", newDeal.deal(8));
// console.log("\n\n");
// console.log("Player 6 hand:\n", newDeal.deal(8));
