import { CARDS_DRAW_KEEP_STATES, CARD_STACK, MODULE_ID, SETTINGS_KEYS } from '@module/constants';

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

/**
 * Recalls all the discarded initiative cards
 * and shuffles them back into the initiative deck.
 * @param {boolean} [chatNotification=false] Whether to send a chat notification.
 */
export async function resetInitiativeDeck(chatNotification = false, toExclude = []) {
  const initiativeDeck = getInitiativeDeck(true);
  const discardPile = getInitiativeDeckDiscardPile(true);
  const toRecall = discardPile.cards.filter(c => !toExclude.includes(c.value)).map(c => c.id);

  await discardPile.pass(initiativeDeck, toRecall, { chatNotification });
  await initiativeDeck.shuffle({ chatNotification });

  ui.notifications.info('YZEC.Combat.Initiative.ResetDeck', { localize: true });
}

/**
 * Gets the sort order defined in the game settings.
 * @param {CARDS_DRAW_KEEP_STATES} [keepState] Keep state of the combatant
 *   to further modify the sort order
 * @returns {1|-1} 1: Ascending | -1: Descending
 */
export function getCardSortOrderModifier(keepState) {
  const n = game.settings.get(MODULE_ID, SETTINGS_KEYS.INITIATIVE_SORT_ORDER) || 1;
  if (keepState) {
    const m = keepState === CARDS_DRAW_KEEP_STATES.BEST ? 1 : -1;
    return n * m;
  }
  return n;
}

/**
 * Gets the modifier for the followers' card value
 * depending on the default sort order defined in the game settings.
 * @returns {0.01|-0.01}
 */
export function getCombatantSortOrderModifier() {
  return getCardSortOrderModifier() >= 1 ? 0.01 : -0.01;
}
