import { YZEC } from '@module/config';
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

  // get isFollower() {
  //   return !this.isGroupLeader && !!this.groupId;
  // }

  get groupColor() {
    return this.getFlag(MODULE_ID, 'groupColor');
  }

  async setGroupColor(color) {
    return this.setFlag(MODULE_ID, color);
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
  /*  Groups Methods                            */
  /* ------------------------------------------ */

  async promoteLeader(cardValue) {
    const updateData = {
      [`flags.${MODULE_ID}`]: {
        isGroupLeader: true,
        '-=groupId': null,
      },
    };
    if (typeof cardValue !== 'undefined') updateData[`flags.${MODULE_ID}.cardValue`] = cardValue;
    return this.update(updateData);
  }

  /* ------------------------------------------ */

  async unpromoteLeader() {
    for (const f of this.getFollowers()) await f.unsetGroupId();
    return this.unsetIsGroupLeader();
  }

  /* ------------------------------------------ */

  async addFollower(fCombatant, { cardValue, initiative } = {}) {
    const updateData = {
      [`flags.${MODULE_ID}`]: {
        groupId: this.id,
        '-=isGroupLeader': null,
      },
    };
    if (typeof initiative !== 'undefined') updateData.initiative = initiative;
    if (typeof cardValue !== 'undefined') updateData[`flags.${MODULE_ID}.cardValue`] = cardValue;
    return fCombatant.update(updateData);
  }

  /* ------------------------------------------ */

  // async addFollowers(combatants) {
  //   this.combat.updateEmbeddedDocuments('Combatant', combatants.map(c => ({
  //     _id: c.id,
  //     [`flags.${MODULE_ID}`]: {
  //       groupId: this.id,
  //       '-=isGroupLeader': null,
  //     },
  //   })));
  // }

  /* ------------------------------------------ */

  /**
   * Gets the followers of this combatant.
   * @returns {YearZeroCombatant[]}
   */
  getFollowers() {
    return this.combat.combatants.filter(f => f.groupId === this.id);
  }

  /**
   * Gets the leader of this combatant.
   * @returns {YearZeroCombatant}
   */
  getLeader() {
    if (this.isGroupLeader) return this;
    return this.combat.combatants.get(this.groupId);
  }

  /**
   * Gets the color of this combatant or its group.
   * @returns {string}
   */
  getColor() {
    if (this.groupColor) return this.groupColor;
    if (this?.players.length) return this.players[0].color;
    return game.users.find(u => u.isGM)?.color || YZEC.defaultGroupColor;
  }

  /* ------------------------------------------ */
  /*  Initiative Methods                        */
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
