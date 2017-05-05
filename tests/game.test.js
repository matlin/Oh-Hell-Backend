const Game = require('../game/game.js');

let newGame = new Game();
let player1;
let player2;
let firstTurn;
let secondTurn;

test("creates new game", () =>{
  expect(newGame.state.started).toBe(false);
  expect(newGame.state.dealer).toBeNull();
  expect(newGame.state.players.length).toBe(0);
});


test("adding a player", () =>{
  player1 = newGame.addPlayer(1, "Ben");
  expect(newGame.state.started).toBe(false);
  expect(newGame.state.players.length).toBe(1);
});
test("adding a second player", () =>{
  player2 = newGame.addPlayer(2, "Jack");
  expect(newGame.state.started).toBe(false);
  expect(newGame.state.players.length).toBe(2);
});

test("start game", () =>{
  newGame.start();
  expect(newGame.state.started).toBe(true);
  expect(newGame.state.dealer).not.toBeNull();
  expect(newGame.state.betting).toBe(true);
  expect(newGame.state.trumpCard).not.toBeNull();
  //expect(newGame.state.turn).toBe(player2);

});


test("get a player", () =>{
  expect(newGame.getPlayer(1)).toBe(player1);
});

test("make a bad bet", ()=>{
  console.log(newGame.state.turn);
  newGame.bet(newGame.state.turn, 2);
  expect(newGame.state.betting).toBe(true);
});



test("make a bet", () =>{
  firstTurn = newGame.state.turn;
  newGame.bet(newGame.state.turn, 1);
  expect(newGame.state.turn._id).not.toBe(firstTurn._id);
  expect(newGame.state.betting).toBe(true);
});

test("make a second bet", () =>{
  secondTurn = newGame.state.turn;
  //this is the dealers bet, should only be able to bet 1,
  //because it cant have the same number of bets as tricks
  //need to test for this, when implemented
  newGame.bet(newGame.state.turn, 1);
  expect(newGame.state.turn._id).toBe(firstTurn._id);
  expect(newGame.state.betting).toBe(false);
});

test("play a card", () =>{
  let theCard = firstTurn.hand[0];
  newGame.play(firstTurn, firstTurn.hand[0].id);
  console.log(newGame.state.cardsInPlay);
  let value = newGame.state.cardsInPlay.values();
  expect(theCard).toBe(value.next().value);
});

test("play a second card", () =>{
  newGame.play(secondTurn, secondTurn.hand[0].id);
  console.log(newGame.state.cardsInPlay);
  expect(newGame.state.cardsInPlay.size).toBe(0);
});
