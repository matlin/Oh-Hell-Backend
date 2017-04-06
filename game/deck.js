/*
  This function creates the deck of cards for a given game of Oh Hell

  Updated: 4.5.17
*/

const card_suits = ['clubs', 'diamonds', 'hearts', 'spades'];
const card_names = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10','J','Q','K'];


// card class
function Card(name, suit) {
    this.name = name;
    this.suit = suit;
    var card = [];
    card.push(name);
    card.push(suit);
    return card;
}

// deck class
function Deck() {
    this.deck = this.build();
}

// creats deck of cards using card class
Deck.prototype.build = function() {
   var deck = [];
   for( var s = 0; s < card_suits.length; s++ ) {
       for( var n = 0; n < card_names.length; n++ ) {
           deck.push(new Card(card_names[n], card_suits[s]));
       }
   }
   return deck;
 };

// accessor class for deck
Deck.prototype.get = function() {
    return this.deck;
}

// pops desired number of cards
Deck.prototype.deal = function(num_cards) {
    return toStr(this.deck.splice(0,num_cards));
};

// pops a single card
Deck.prototype.pop = function()
{
    return toStr(this.deck.splice(0,1));
};

// shuffles deck of cards
Deck.prototype.shuffle = function() {
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
function toStr(deck) {
    var deckToString = deck.slice(0);
    for( var i = 0; i < deckToString.length; i++ ) {
      deckToString[i]= deckToString[i].join('-');
    }
    return deckToString.join('\n ');
};

//TESTING CODE
// var newDeal = new Deck();
// console.log("Full deck, in order:\n", toStr(newDeal.get()));
// newDeal.shuffle();
// console.log("\n");
// console.log("Full deck, not in order:\n", toStr(newDeal.get()));
// console.log("\n");
// console.log("Trump card: ", newDeal.pop());
// console.log("\n");
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
