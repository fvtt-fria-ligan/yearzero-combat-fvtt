import { MODULE_NAME, CARD_STACK } from '@module/constants';

/**
 * A static class (cannot be instantiated) with utility methods
 * to customize
 * @static
 */
export class YearZeroCombatHook {
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
}

/**
 * Gets the canvas (if ready).
 * @returns {Canvas}
 */
export function getCanvas() {
  if (canvas instanceof Canvas && canvas.ready) {
    return canvas;
  }
  throw new Error('No Canvas available');
}

/**
 * Gets the initiative deck.
 * @param {boolean} [strict=false] Whether to throw an error if not found
 * @returns {Cards}
 */
export function getInitiativeDeck(strict = false) {
  return game.cards.get(game.settings.get(MODULE_NAME, CARD_STACK.INITIATIVE_DECK), { strict });
}

/**
 * Gets the discard pile of the initiative deck.
 * @param {boolean} [strict=false] Whether to throw an error if not found
 * @returns {CardsPile}
 */
export function getInitiativeDeckDiscardPile(strict = false) {
  return game.cards.get(game.settings.get(MODULE_NAME, CARD_STACK.DISCARD_PILE), { strict });
}

export function duplciateCombatant(combatant) {
  const clone = deepClone(combatant);
  return clone;
}
