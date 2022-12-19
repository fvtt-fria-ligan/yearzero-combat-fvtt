import { CARD_STACK, MODULE_ID } from '@module/constants';

/**
 * An abstract class (cannot be instantiated) with utility methods
 * to customize the settings of the module on game start.
 * @static
 */
export default class YearZeroCombatHook {
  constructor() {
    throw new SyntaxError('This class cannot be instantiated!');
  }

  /**
   * Registers game settings for this module.
   * @param {Object.<string, boolean|string|number>} settings
   *   Pairs of key-value to register in the game settings
   * @param {boolean} [once=true] Whether to register the setting only if the setting is undefined
   * @returns {Promise.<void>}
   */
  static async register(settings, once = true) {
    for (const [k, v] of Object.entries(settings)) {
      try {
        if (once && game.settings.get(MODULE_ID, k)) continue;
        await game.settings.set(MODULE_ID, k, v);
      }
      catch (err) {
        console.error(err);
      }
    }
  }

  /**
   * Sets the initiative deck's ID (or name) in the game settings.
   * @param {string}   id         ID or name of the card stack to register
   * @param {boolean} [once=true] Whether to register the setting only if the setting is undefined
   * @returns {Promise.<void>}
   */
  static async setInitiativeDeck(id, once = true) {
    return this.register({ [CARD_STACK.INITIATIVE_DECK]: id }, once);
  }

  /**
   * Sets the discard pile's ID (or name) in the game settings.
   * @param {string}   id         ID or name of the card stack to register
   * @param {boolean} [once=true] Whether to register the setting only if the setting is undefined
   * @returns {Promise.<void>}
   */
  static async setDiscardPile(id, once = true) {
    return this.register({ [CARD_STACK.DISCARD_PILE]: id }, once);
  }

  /**
   * Changes the default starting Initiative Deck data.
   * @param {string} src Path to the Initiative Deck preset JSON
   * @static
   */
  static setSourceForInitiativeDeckPreset(src = '') {
    if (typeof src !== 'string') throw new Error('Source path to the Initiative Deck preset JSON must be a String');
    CONFIG.Cards.presets.initiative.src = src;
  }

  /**
   * Changes the default starting Combat Tracker data.
   * @param {string} src Path to the Combat Tracker preset JSON
   * @static
   */
  static setSourceForCombatTrackerPreset(src = '') {
    if (typeof src !== 'string') throw new Error('Source path to the Combat Tracker preset JSON must be a String');
    CONFIG.YZE_COMBAT.CombatTracker.src = src;
  }
}
