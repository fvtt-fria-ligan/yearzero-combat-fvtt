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
   * @param {number} [drawMode=0] How to draw the cards, e.g. from the top of the deck
   * @returns {Promise.<Card[]>} An array of drawn cards, in the order they were drawn
   * @see {@link CONST.CARD_DRAW_MODES}
   */
  async drawInitiative(to, qty = 1, drawMode = foundry.CONST.CARD_DRAW_MODES.TOP) {
    // Exits early if invalid deck type.
    if (this.type !== 'deck') {
      const msg = game.i18n.localize('YZEC.WARNING.InvalidDeckType');
      throw new TypeError(msg);
    }

    // Draws the cards.
    const drawn = this._drawCards(qty, drawMode);

    // Processes the card data.
    const toCreate = [];
    const toUpdate = [];
    const toDelete = [];
    for (const card of drawn) {
      const createData = card.toObject();
      if (card.isHome || !createData.origin) createData.origin = this.id;
      toCreate.push(createData);
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
}
