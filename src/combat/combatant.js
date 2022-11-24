import { MODULE_ID } from '@module/constants';
import { getCanvas } from '../utils/client-hooks';

export default class YearZeroCombatant extends Combatant {
  async setCardValue(cardValue) {
    return this.setFlag(MODULE_ID, 'cardValue', cardValue);
  }

  get cardValue() {
    return this.getFlag(MODULE_ID, 'cardValue');
  }

  get cardString() {
    return this.getFlag(MODULE_ID, 'cardString');
  }

  async setCardString(cardString) {
    return this.setFlag(MODULE_ID, 'cardString', cardString);
  }

  get fastAction() {
    return this.getFlag(MODULE_ID, 'fastAction');
  }

  get slowAction() {
    return this.getFlag(MODULE_ID, 'slowAction');
  }

  async setDrawSize(drawSize) {
    return this.setFlag(MODULE_ID, 'drawSize', drawSize);
  }

  get drawSize() {
    return this.getFlag(MODULE_ID, 'drawSize');
  }

  async setKeepSize(keepSize) {
    return this.setFlag(MODULE_ID, 'keepSize', keepSize);
  }

  get keepSize() {
    return this.getFlag(MODULE_ID, 'keepSize');
  }

  async setKeepState(keepState) {
    return this.setFlag(MODULE_ID, 'keepState', keepState);
  }

  get keepState() {
    return this.getFlag(MODULE_ID, 'keepState');
  }

  async setDrawTimes(drawTimes) {
    return this.setFlag(MODULE_ID, 'keepState', drawTimes);
  }

  get drawTimes() {
    return this.getFlag(MODULE_ID, 'drawTimes');
  }

  /**
   * @param {Combatant} target The combatant with which this combatant will swap a card
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
    this.updateSource({
      flags: {
        [MODULE_ID]: {
          cardValue: sortValue,
        },
      },
    });
  }
}
