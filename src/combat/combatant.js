import { CARDS_DRAW_KEEP_STATES, MODULE_ID, SETTINGS_KEYS } from '@module/constants';
import { getCanvas } from '@utils/utils';

export default class YearZeroCombatant extends Combatant {

  /* ------------------------------------------ */
  /*  Properties                                */
  /* ------------------------------------------ */

  get cardValue() {
    return this.getFlag(MODULE_ID, 'cardValue');
  }

  async setCardValue(cardValue) {
    return this.setFlag(MODULE_ID, 'cardValue', cardValue);
  }

  get cardDescription() {
    return this.getFlag(MODULE_ID, 'cardDescription');
  }

  async setCardDescription(cardDescription) {
    return this.setFlag(MODULE_ID, 'cardDescription', cardDescription);
  }

  /* ------------------------------------------ */

  get fastAction() {
    return this.getFlag(MODULE_ID, 'fastAction');
  }

  async setFastAction(action) {
    return this.setFlag(MODULE_ID, 'fastAction', action);
  }

  get slowAction() {
    return this.getFlag(MODULE_ID, 'slowAction');
  }

  async setSlowAction(action) {
    return this.setFlag(MODULE_ID, 'slowAction', action);
  }

  /* ------------------------------------------ */

  /**
   * The quantity of initiative cards to draw.
   * @type {number}
   * @default 1
   * @readonly
   */
  get drawSize() {
    return this.getFlag(MODULE_ID, 'drawSize') ?? 1;
  }

  async setDrawSize(drawSize) {
    return this.setFlag(MODULE_ID, 'drawSize', drawSize);
  }

  /* ------------------------------------------ */

  /**
   * Card keeping behavior.
   * @type {CARDS_DRAW_KEEP_STATES}
   * @default CARDS_DRAW_KEEP_STATES.BEST
   * @readonly
   */
  get keepState() {
    return this.getFlag(MODULE_ID, 'keepState') ?? CARDS_DRAW_KEEP_STATES.BEST;
  }

  async setKeepState(keepState) {
    return this.setFlag(MODULE_ID, 'keepState', keepState);
  }

  /* ------------------------------------------ */

  get groupId() {
    return this.getFlag(MODULE_ID, 'groupId');
  }

  async setGroupId(groupId) {
    return this.setFlag(MODULE_ID, 'groupId', groupId);
  }

  async unsetGroupId() {
    return this.unsetFlag(MODULE_ID, 'groupId');
  }

  get isGroupLeader() {
    return this.getFlag(MODULE_ID, 'isGroupLeader');
  }

  async setIsGroupLeader(isGroupLeader) {
    return this.setFlag(MODULE_ID, 'isGroupLeader', isGroupLeader);
  }

  async unsetIsGroupLeader() {
    return this.unsetFlag(MODULE_ID, 'isGroupLeader');
  }

  /* ------------------------------------------ */
  /*  Utility Methods                           */
  /* ------------------------------------------ */

  /**
   * Gets the speed value from the combatant's actor.
   * @returns {number}
   */
  getSpeedFromActor() {
    const key = game.settings.get(MODULE_ID, SETTINGS_KEYS.ACTOR_SPEED_ATTRIBUTE);
    const speed = foundry.utils.getProperty(this.actor, key) || 1;
    return Number(speed);
  }

  /* ------------------------------------------ */

  /**
   * Gets the draw size value from the combatant's actor.
   * @returns {number}
   */
  getDrawSizeFromActor() {
    const key = game.settings.get(MODULE_ID, SETTINGS_KEYS.ACTOR_DRAWSIZE_ATTRIBUTE);
    const drawSize = foundry.utils.getProperty(this.actor, key) || 1;
    return Number(drawSize);
  }

  /* ------------------------------------------ */

  /**
   * Gets the total number of cards to draw for this combatant.
   * @returns {number}
   */
  getNumberOfCardsToDraw() {
    // TODO add talents here, if any.
    return this.drawSize;
  }

  /* ------------------------------------------ */

  /**
   * Gets the followers of this combatant.
   * @returns {YearZeroCombatant[]}
   */
  getFollowers() {
    return this.combat.combatants.filter(f => f.groupId === this.id);
  }

  /* ------------------------------------------ */

  async resetInitiative() {
    return this.updateSource({
      initiative: null,
      [`flags.${MODULE_ID}`]: {
        cardValue: null,
        cardDescription: '',
        '-=fastAction': null,
        '-=slowAction': null,
      },
    });
  }

  /* ------------------------------------------ */

  /**
   * Swaps initiative cards between two combatants.
   * @param {Combatant} target The combatant with which this combatant will swap a card
   */
  // TODO  recalculate the turn order on complettion
  async swapInitiativeCard(target) {
    const combatantCardValue = this.cardValue;
    await this.setCardValue(target.cardValue);
    await target.setCardValue(combatantCardValue);
  }

  /* ------------------------------------------ */
  /*  Combatant Creation                        */
  /* ------------------------------------------ */

  /**
   * @param {CombatantDataConstructorData} data
   * @param {DocumentModificationOptions}  options
   * @param {string} user
   * @override
   */
  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);
    const combatants = game?.combat?.combatants.size ?? 0;
    const tokenId = data.tokenId instanceof TokenDocument ? data.tokenId.id : data.tokenId;
    const tokenIndex = getCanvas()
      .tokens?.controlled.map(t => t.id)
      .indexOf(tokenId) ?? 0;
    const sortValue = tokenIndex + combatants;
    this.updateSource({
      flags: {
        [MODULE_ID]: {
          cardValue: sortValue,
          drawSize: this.getDrawSizeFromActor(),
        },
      },
    });
  }
}
