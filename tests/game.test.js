const Game = require('../game/game.js');

let newGame = new Game();
let player;

test("creates new game", () =>{
  expect(newGame.state.started).toBe(false);
  expect(newGame.state.dealer).toBeNull();
  expect(newGame.state.players.length).toBe(0);
});


test("adding a player", () =>{
  player = newGame.addPlayer(1, "Ben");
  expect(newGame.state.started).toBe(false);
  expect(newGame.state.players.length).toBe(1);
});

test("start game", () =>{
  newGame.start();
  expect(newGame.state.started).toBe(true);
  expect(newGame.state.dealer).not.toBeNull();
  expect(newGame.state.betting).toBe(true);
  expect(newGame.state.trumpCard).not.toBeNull();
  expect(newGame.state.turn).toBe(player);

});

test("get a player", () =>{
  expect(newGame.getPlayer(1)).toBe(player);
});

test("make a bad bet", ()=>{
  newGame.bet(player, 2);
  expect(newGame.state.betting).toBe(true);
});

test("make a bet", () =>{
  newGame.bet(player, 1);
  expect(newGame.state.turn).toBe(player);
  expect(newGame.state.betting).toBe(false);
});

/*test("play a card", () =>{
  newGame.play(player, player.hand[0].id)
  //expect(newGame.state.turn).toBe(player);
  console.log(newGame.state.cardsInPlay.entries());
  //expect(newGame.state.cardsInPlay.has(player.id)).toBeTruthy();
});
*/
