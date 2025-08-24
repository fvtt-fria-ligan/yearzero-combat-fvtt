import { CARD_STACK, MODULE_ID, SETTINGS_KEYS } from '@module/constants';

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
   * @param {boolean} [once=true] Only register the settings if the registration never happened
   * @param {boolean} [finishConfiguration=true] Whether to set the module as configured after registration
   * @returns {Promise.<void>}
   */
  static async register(settings, once = true, finishConfiguration = true) {
    if (!game.user?.isGM) return;

    const isConfigured = await game.settings.get(MODULE_ID, SETTINGS_KEYS.CONFIGURED);
    if (isConfigured && once) return;

    for (const [k, v] of Object.entries(settings)) {
      try {
        await game.settings.set(MODULE_ID, k, v);
      }
      catch (err) {
        console.error(err);
      }
    }

    if (finishConfiguration) { await this.finishConfiguration(); }
  }

  static async finishConfiguration() {
    if (!game.user?.isGM) return;

    await game.settings.set(MODULE_ID, SETTINGS_KEYS.CONFIGURED, true);
  }

  /**
   * Sets the initiative deck's ID (or name) in the game settings.
   * Should be called before the `register` method, or called with the `once` parameter set to `false`.
   * @param {string}   id         ID or name of the card stack to register
   * @param {boolean} [once=true] Whether to register the setting only if the setting is undefined
   * @param {boolean} [finishConfiguration=false] Whether to set the module as configured after registration
   * @returns {Promise.<void>}
   */
  static async setInitiativeDeck(id, once = true, finishConfiguration = false) {
    return this.register({ [CARD_STACK.INITIATIVE_DECK]: id }, once, finishConfiguration);
  }

  /**
   * Sets the discard pile's ID (or name) in the game settings.
   * Should be called before the `register` method, or called with the `once` parameter set to `false`.
   * @param {string}   id         ID or name of the card stack to register
   * @param {boolean} [once=true] Whether to register the setting only if the setting is undefined
   * @param {boolean} [finishConfiguration=false] Whether to set the module as configured after registration
   * @returns {Promise.<void>}
   */
  static async setDiscardPile(id, once = true, finishConfiguration = false) {
    return this.register({ [CARD_STACK.DISCARD_PILE]: id }, once, finishConfiguration);
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
