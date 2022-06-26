// eslint-disable-next-line max-len
/** @typedef {import('@league-of-foundry-developers/foundry-vtt-types/src/foundry/client/data/documents/combat').InitiativeOptions} InitiativeOptions */
import { getInitiativeDeck, getInitiativeDeckDiscardPile } from '../utils/client-hooks';

export default class YearZeroCombat extends Combat {
  // TODO https://gitlab.com/peginc/swade/-/blob/develop/src/module/documents/SwadeCombat.ts

  /**
   * @param {string|string[]} ids
   * @param {InitiativeOptions} options
   * @override
   */
  async rollInitiative(ids, options) {
    ids = typeof ids === 'string' ? [ids] : ids;
    const initiativeDeck = getInitiativeDeck(true);
    const { messageOptions } = options;
    const messages = [];

    if (ids.length > initiativeDeck.availableCards.length) {
      const message = game.i18n.format('YZE.Combat.Initiative.NotEnoughCards', {
        count: ids.length,
        available: initiativeDeck.availableCards.length,
      });
      ui.notifications.warn(message);
      return this;
    }

    for (const id of ids) {
      const combatant = this.combatants.get(id, true);
      if (combatant.isDefeated) continue;
      const drawSize = 1;
      // TODO add hooks for more than one card to be drawn
      // let card;
      const cards = await initiativeDeck.draw(drawSize);
      // TODO add logic for how we handle multiple cards
      const card = cards[0];
      const flags = {
        cardValue: card.data.value,
        // cardString: card.data.name, // here if we need it!
      };
      const initiative = card?.data.value;
      combatant.data.update({ initiative: initiative, 'flags.yze-combat': flags });

      const template = `
      <section class="initiative-card">
      <div class="initiative-card-container">
      <img class="initiative-card-image" src="${card?.face?.img}" />
      </div>
      <h4 class="result-text result-text-card">${card?.name}</h4>
      </section>`;

      const messageData = mergeObject(
        {
          speaker: {
            scene: game.scenes?.active?.id,
            actor: combatant.actor ? combatant.actor.id : null,
            alias: `${combatant.token.name} ${game.i18n.localize('YZE.Combat.Initiative.Draw')}`,
          },
          whisper: combatant.token?.data.hidden || combatant.hidden ? game?.users?.filter(user => user.isGM) : [],
          content: template,
        },
        messageOptions,
      );
      messages.push(messageData);
    }

    await this.update({ combatants: this.combatants.toObject() }, { diff: false });
    this.playInitiativeSound();
    await CONFIG.ChatMessage.documentClass.createDocuments(messages);

    const combatants = ids.map(id => this.combatants.get(id, { strict: true }));

    // Return the updated Combat
    return this;
  }

  /**
   *
   * sort the combatants by initiative order low to high
   *
   * @param {combatant} a
   * @param {combatant} b
   *
   * @override */
  _sortCombatants(a, b) {
    if (!a || !b) return 0;

    if (a.cardValue < b.cardValue) return 1;
    if (a.cardValue > b.cardValue) return -1;
    return 0;
  }

  /**
   * Draws cards from the Initiative Deck.
   * @param {number} [qty=1] Quantity of cards to draw
   * @returns {Promise.<Cards[]>}
   * @async
   */
  async drawCard(qty = 1) {
    /** @type {import('./cards').default} */
    const initiativeDeck = getInitiativeDeck(true);
    const discardPile = getInitiativeDeckDiscardPile(true);
    return initiativeDeck.drawInitiative(discardPile, qty);
  }

  // not sure we need this
  async pickCard() {
    // TODO
  }

  /**
   * find a specific card in the deck
   *
   * @param {number} cardValue
   */
  findCard(cardValue) {
    const initiativeDeck = getInitiativeDeck(true);
    return initiativeDeck.cards.find(value => value.data.value === cardValue);
  }

  /** @override */
  async resetAll() {
    // TODO
  }

  /** @override */
  async startCombat() {
    const combatantsIds = this.combatants
      .filter(combatant => !combatant.isDefeated && combatant.initiative === null)
      .map(combatant => combatant.id);
    await this.rollInitiative(combatantsIds);
    return super.startCombat();
  }

  /** @override */
  async nextTurn() {
    // TODO
  }

  /** @override */
  async nextRound() {
    // TODO reset fast and slow actions for each combatant
  }

  // _getInitResetUpdate() {}
  // _handleStartOfTurnExpirations() {}
  // _handleEndOfTurnExpirations() {}

  async playInitiativeSound() {
    const data = {
      // TODO src of sound
      // src: 'modules/yze-combat/assets/sounds/initiative.wav'
      volume: 0.75,
      autoplay: true,
      loop: false,
    };
    AudioHelper.playSound(data);
  }
}
