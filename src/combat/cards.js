/* ------------------------------------------ */
/*  CARDS                                     */
/*   Original author: FloRad (SWADE system)   */
/*   https://gitlab.com/peginc/swade          */
/* ------------------------------------------ */

/**
 * Year Zero Cards
 * @class
 * @extends {Cards}
 */
// eslint-disable-next-line no-undef
export default class YearZeroCards extends Cards {
  /**
   * Draws cards for initiative.
   * @param {Cards}   to          The cards document to which the cards are deposited
   * @param {number} [qty=1]      How many cards to draw
   * @param {number} [drawMode=2] How to draw the cards, e.g. from the top of the deck
   * @param {Card[]} [cards]      The cards to draw (if they have been peeked at for example)
   * @returns {Promise.<Card[]>} An array of drawn cards, in the order they were drawn
   * @see {@link CONST.CARD_DRAW_MODES}
   */
  async drawInitiative(to, qty = 1, drawMode = foundry.CONST.CARD_DRAW_MODES.RANDOM, cards = null) {
    // Exits early if invalid deck type.
    if (this.type !== 'deck') {
      const msg = game.i18n.localize('YZEC.WARNING.InvalidDeckType');
      throw new TypeError(msg);
    }

    // Draws the cards.
    const drawn = cards ?? this._drawCards(qty, drawMode);

    // Processes the card data.
    const toCreate = [];
    const toUpdate = [];
    const toDelete = [];
    for (const card of drawn) {
      const createData = card.toObject();
      if (card.isHome || !createData.origin) createData.origin = this.id;
      // Card may already exist in discard pile if the initiative deck was reshuffled while
      // a card selection dialog was open and the player selected the same card as someone else.
      // In this case, allow the player to "draw" the duplicate, but don't create a duplicate in the discard pile.
      if (!to.cards.contents.find(c => c.id === card.id)) {
        toCreate.push(createData);
      }
      if (card.isHome) toUpdate.push({ _id: card.id, drawn: true });
      else toDelete.push(card.id);
    }

    // Saves modifications.
    await Promise.all([
      to.createEmbeddedDocuments('Card', toCreate, { keepId: true }),
      this.deleteEmbeddedDocuments('Card', toDelete),
    ]);

    // Returns the drawn cards.
    return this.updateEmbeddedDocuments('Card', toUpdate);
  }

  /**
   * Peek at cards for initiative. Sets them as drawn but does not remove them from the deck.
   * @param {number} [qty=1]      How many cards to draw
   * @param {number} [drawMode=2] How to draw the cards, e.g. from the top of the deck
   * @returns {Card[]} An array of cards, in the order they were drawn
   * @see {@link CONST.CARD_DRAW_MODES}
   */
  async peekInitiative(qty = 1, drawMode = foundry.CONST.CARD_DRAW_MODES.RANDOM) {
    // Exits early if invalid deck type.
    if (this.type !== 'deck') {
      const msg = game.i18n.localize('YZEC.WARNING.InvalidDeckType');
      throw new TypeError(msg);
    }

    // Draws the cards.
    const drawn = this._drawCards(qty, drawMode);

    // Processes the card data.
    const toUpdate = [];
    for (const card of drawn) {
      if (card.isHome) {
        // Set to drawn so that other players can't draw it.
        toUpdate.push({ _id: card.id, drawn: true });
      }
    }
    // Returns the drawn cards.
    return this.updateEmbeddedDocuments('Card', toUpdate);
  }

  /**
   * Returns peeked at cards. Sets them as not drawn.
   * @param {Card[]} [cards]      The cards to return
   * @returns {Card[]}            An array of cards, in the order they were drawn
   */
  async returnPeekedAtCards(cards) {
    // Exits early if invalid deck type.
    if (this.type !== 'deck') {
      const msg = game.i18n.localize('YZEC.WARNING.InvalidDeckType');
      throw new TypeError(msg);
    }

    // Processes the card data.
    const toUpdate = [];
    for (const card of cards) {
      if (card.isHome) {
        toUpdate.push({ _id: card.id, drawn: false });
      }
    }
    // Returns the drawn cards.
    return this.updateEmbeddedDocuments('Card', toUpdate);
  }
}
