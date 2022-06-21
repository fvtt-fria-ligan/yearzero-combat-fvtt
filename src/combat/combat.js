// eslint-disable-next-line max-len
/** @typedef {import('@league-of-foundry-developers/foundry-vtt-types/src/foundry/client/data/documents/combat').InitiativeOptions} InitiativeOptions */

export default class YearZeroCombat extends Combat {
  // TODO https://gitlab.com/peginc/swade/-/blob/develop/src/module/documents/SwadeCombat.ts

  /**
   * @param {string|string[]} ids
   * @param {InitiativeOptions} options
   * @override
   */
  async rollInitiative(ids, options) {
    ids = typeof ids === 'string' ? [ids] : ids;
    // TODO
  }

  /** @override */
  _sortCombatants(a, b) {
    if (!a || !b) return 0;
    // TODO
  }

  /**
   * Draws cards from the Initiative Deck.
   * @param {number} [qty=1] Quantity of cards to draw
   * @returns {Promise.<Cards[]>}
   * @async
   */
  async drawCard(qty = 1) {
    const deckId = 0; // TODO
    /** @type {import('./cards').default} */
    const initiativeDeck = game.cards.get(deckId, { strict: true }); // strict:true throws an error if not found.
    const discardId = 0; // TODO
    const discardPile = game.cards.get(discardId, { strict: true });
    return initiativeDeck.drawInitiative(discardPile, qty);
  }

  async pickCard() {
    // TODO
  }
  findCard() {
    // TODO
  }

  /** @override */
  async resetAll() {
    // TODO
  }
  /** @override */
  async startCombat() {
    // TODO
  }
  /** @override */
  async nextTurn() {
    // TODO
  }
  /** @override */
  async nextRound() {
    // TODO
  }
  _getInitResetUpdate() {}
  _handleStartOfTurnExpirations() {}
  _handleEndOfTurnExpirations() {}
  async playInitiativeSound() {}
}