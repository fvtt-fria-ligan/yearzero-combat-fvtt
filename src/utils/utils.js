import { CARD_STACK, MODULE_ID } from '@module/constants';

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
 * @returns {import('../combat/cards').default}
 */
export function getInitiativeDeck(strict = false) {
  const id = game.settings.get(MODULE_ID, CARD_STACK.INITIATIVE_DECK);
  let deck = game.cards.get(id);
  if (!deck) deck = game.cards.getName(id, { strict });
  return deck;
}

/**
 * Gets the discard pile of the initiative deck.
 * @param {boolean} [strict=false] Whether to throw an error if not found
 * @returns {CardsPile}
 */
export function getInitiativeDeckDiscardPile(strict = false) {
  const id = game.settings.get(MODULE_ID, CARD_STACK.DISCARD_PILE);
  let pile = game.cards.get(id);
  if (!pile) pile = game.cards.getName(id, { strict });
  return pile;
}
