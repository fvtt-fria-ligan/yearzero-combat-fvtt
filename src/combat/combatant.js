import { getCanvas } from '../utils/client-hooks';
export default class YearZeroCombatant extends Combatant {
  async setCardValue(cardValue) {
    return this.setFlag('yze-combat', 'cardValue', cardValue);
  }

  get cardValue() {
    return this.getFlag('yze-combat', 'cardValue');
  }

  get cardString() {
    return this.getFlag('yze-combat', 'cardString');
  }

  async setCardString(cardString) {
    return this.setFlag('yze-combat', 'cardString', cardString);
  }

  get fastAction() {
    return this.getFlag('yze-combat', 'fastAction');
  }

  get slowAction() {
    return this.getFlag('yze-combat', 'slowAction');
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
        'yze-combat': {
          cardValue: sortValue,
        },
      },
    });
  }
}
