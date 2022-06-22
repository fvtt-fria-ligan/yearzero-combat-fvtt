export default class YearZeroCombatant extends Combatant {
  // TODO https://gitlab.com/peginc/swade/-/blob/develop/src/module/documents/SwadeCombatant.ts

  async setCardValue(cardValue) {
    return this.setFlag('yzec', 'cardValue', cardValue);
  }

  get cardValue() {
    return this.getFlag('yzce', 'cardValue');
  }

  get cardString() {
    return this.getFlag('yzce', 'cardString');
  }

  async setCardString(cardString) {
    return this.setFlag('yzce', 'cardString', cardString);
  }
  /**
   * 
   * @param {Combatant} target    the combatant with which this combatant will swap a card
   */
  // TODO  recalculate the turn order on complettion
  async swapInitiativeCard(target) {
    const combatantCard = this.cardValue();
    this.setCardValue(target.cardValue());
    target.setCardValue(combatantCard);
  }

  /**
   * @override
   * 
   *
   **/

  rollInitiative() {}
}
