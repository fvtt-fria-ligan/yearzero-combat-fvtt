import { YZEC } from '@module/config';
import { CARDS_DRAW_KEEP_STATES, MODULE_ID, SETTINGS_KEYS } from '@module/constants';
import { getCanvas, getCombatantSortOrderModifier } from '@utils/utils';

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

  get cardName() {
    return this.getFlag(MODULE_ID, 'cardName');
  }

  async setCardName(cardName) {
    return this.setFlag(MODULE_ID, 'cardName', cardName);
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
    const maxDrawSize = game.settings.get(MODULE_ID, SETTINGS_KEYS.MAX_DRAW_SIZE);
    const key = game.settings.get(MODULE_ID, SETTINGS_KEYS.ACTOR_DRAWSIZE_ATTRIBUTE);
    const drawSize = foundry.utils.getProperty(this.actor, key) || 1;
    return Math.min(Number(drawSize), maxDrawSize);
  }

  /* ------------------------------------------ */

  /**
   * Gets the total number of cards to draw for this combatant.
   * @returns {number}
   */
  getNumberOfCardsToDraw() {
    // TODO add talents here, if any.
    if (this.lockInitiative) return 0;
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
    // for (const f of this.getFollowers()) await f.unsetGroupId();
    // return this.unsetIsGroupLeader();
    const updates = [{
      _id: this.id,
      [`flags.${MODULE_ID}.-=isGroupLeader`]: null,
    }];
    for (const f of this.getFollowers()) {
      updates.push({
        _id: f.id,
        [`flags.${MODULE_ID}.cardValue`]: this.cardValue,
        [`flags.${MODULE_ID}.-=groupId`]: null,
      });
    }
    return this.combat.updateEmbeddedDocuments('Combatant', updates);
  }

  /* ------------------------------------------ */

  async addFollower(fCombatant, { cardValue, cardName, initiative } = {}) {
    const updateData = {
      initiative: this.initiative,
      [`flags.${MODULE_ID}`]: {
        cardValue: this.cardValue + getCombatantSortOrderModifier(),
        cardName: this.cardName,
        groupId: this.id,
        '-=isGroupLeader': null,
      },
    };
    if (typeof initiative !== 'undefined') updateData.initiative = initiative;
    if (typeof cardValue !== 'undefined') updateData[`flags.${MODULE_ID}.cardValue`] = cardValue;
    if (typeof cardName !== 'undefined') updateData[`flags.${MODULE_ID}.cardName`] = cardName;
    return fCombatant.update(updateData);
  }

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
        cardName: '',
      },
    });
  }

  /* ------------------------------------------ */

  /**
   * Swaps initiative cards between two combatants.
   * @param {YearZeroCombatant} tCombatant The combatant with which this combatant will swap a card
   */
  async swapInitiativeCard(tCombatant) {
    const updates = [{
      _id: this.id,
      initiative: tCombatant.initiative,
      [`flags.${MODULE_ID}.cardValue`]: tCombatant.cardValue,
      [`flags.${MODULE_ID}.cardName`]: tCombatant.cardName,
    }, {
      _id: tCombatant.id,
      initiative: this.initiative,
      [`flags.${MODULE_ID}.cardValue`]: this.cardValue,
      [`flags.${MODULE_ID}.cardName`]: this.cardName,
    }];
    if (this.isGroupLeader) {
      for (const f of this.getFollowers()) {
        updates.push({
          _id: f.id,
          initiative: tCombatant.initiative,
          [`flags.${MODULE_ID}.cardValue`]: tCombatant.cardValue + getCombatantSortOrderModifier(),
          [`flags.${MODULE_ID}.cardName`]: tCombatant.cardName,
        });
      }
    }
    if (tCombatant.isGroupLeader) {
      for (const f of tCombatant.getFollowers()) {
        updates.push({
          _id: f.id,
          initiative: this.initiative,
          [`flags.${MODULE_ID}.cardValue`]: this.cardValue + getCombatantSortOrderModifier(),
          [`flags.${MODULE_ID}.cardName`]: this.cardName,
        });
      }
    }
    return this.combat.updateEmbeddedDocuments('Combatant', updates, { turnEvents: false });
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
