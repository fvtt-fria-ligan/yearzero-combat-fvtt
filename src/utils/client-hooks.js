/**
 * An abstract class (cannot be instantiated) with utility methods
 * to customize
 * @static
 */
export default class YearZeroCombatHook {
  constructor() {
    throw new SyntaxError('This class cannot be instantiated!');
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

  static setSourceForCombatTrackerPreset(src = '') {
    if (typeof src !== 'string') throw new Error('Source path to the Combat Tracker preset JSON must be a String');
    CONFIG.YZE_COMBAT.CombatTracker.src = src;
  }
}
