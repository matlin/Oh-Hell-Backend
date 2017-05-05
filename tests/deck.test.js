const Deck = require('../game/deck.js');

test("52 unique cards", () => {
  let dif52 = true;
  let theDeck = new Deck();
  let countedCards = [];
  theDeck.cards.forEach((card) => {
    if (countedCards.includes(card.id)){
      dif52 = false;
    }
    countedCards.push(card.id);
  });
  if (theDeck.cards.length != 52){
    dif52 = false;
  }
  console.log("Checking if 52 cards are unique");
  expect(dif52).toBe(true);
});