//player class to be used to play the game

class Player {

  constructor(id){
    this.id = id;
    this.hand = [];
    this.bet;
    this.tricksWon = 0;
    this.score = 0;
  }

  setBet(bet){
    this.bet = bet;
  }

  addTrick(){
    this.tricksWon++;
  }

  addScore(score){
    this.score += score;
  }

  getHand(){
    return this.hand;
  }

  popCard(index){
    let card = this.hand[index];
    this.hand.splice(index);
    return card;
  }

}
