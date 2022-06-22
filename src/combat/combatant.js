import { getCanvas } from '../utils/client-hooks';
export default class YearZeroCombatant extends Combatant {

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
   * @param {CombatantDataConstructorData} data
   * @param {DocumentModificationOptions} options
   * @param {User} user
   */
  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);
    const combatants = game?.combat?.combatants.size ?? 0;
    const tokenID = data.tokenId instanceof TokenDocument ? data.tokenId.id : data.tokenId;
    const tokenIndex =
      getCanvas()
        .tokens?.controlled.map(t => t.id)
        .indexOf(tokenID) ?? 0;
    const sortValue = tokenIndex + combatants;
    this.data.update({
      flags: {
        yzce: {
          cardValue: sortValue,
        },
      },
    });
  }
}
