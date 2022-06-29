// eslint-disable-next-line max-len
/** @typedef {import('@league-of-foundry-developers/foundry-vtt-types/src/foundry/client/data/documents/combat').InitiativeOptions} InitiativeOptions */
import { duplciateCombatant, getInitiativeDeck, getInitiativeDeckDiscardPile } from '../utils/client-hooks';


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
      const drawSize = combatant.drawSize;
      const keepSize = combatant.keepSize;
      const keepState = combatant.keepState;
      const cards = await initiativeDeck.draw(drawSize);
      if(keepSize > 1) {
        if(keepState === 'best') {
          cards.sort((a, b) => a.data.value - b.data.value);
        }
        else if(keepState === 'worst') {
          cards.sort((a, b) => b.data.value - a.data.value);
        }
        cards.splice(keepSize);
      }

      const cardImage = [];
      const cardName = [];
      const clones = [];
      if (cards.length > 1) {
        cards.forEach(card => {
          const clone = duplciateCombatant(combatant);
          clone.setCardValue(card.data.value);
          cardImage.push(card.face.img);
          cardName.push(card.data.name);
          clones.push(clone);
        });
      }
      else {
        const card = cards[0];
        const initiative = card?.data.value;
        combatant.setCardValue(initiative);
        cardImage.push(card.face.img);
        cardName.push(card.data.name);
      }

      const template = `
      <section class="initiative-card">
      <div class="initiative-card-container">
      ${cardImage.map(img => `<img class="initiative-card-image" src="${img}" />`).join(' ')}
      </div>
      <div class="initiative-card-name-container">
      ${cardName.map(card => `<div class="result-text result-text-card">${card}</div>`).join(' ')}
      </div>
      </section>`;

      const messageData = mergeObject(
        {
          speaker: {
            scene: game.scenes?.active?.id,
            actor: combatant.actor ? combatant.actor.id : null,
            alias: game.i18n.format('YZE.Combat.Initiative.Draw', { name: combatant.token.name }),
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
    // TODO update the combat with the new combatants if we duplicated them

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

  // present a dialog asking to define how many cards to draw
  // ask the user to choose how many cards to keep
  // ask the user if they keep best or worse 
  // draw the cards based on their input
  async setDrawQty(combatant) {
    const template = 'modules/yze-combat/templates/combat/set-draw-qty.hbs';
    const html = await renderTemplate(template, { data: { combatant: combatant } });
    const buttons = {
      draw: {
        label: game.i18n.format('YZE.Combat.Draw'),
        // eslint-disable-next-line no-shadow
        callback: async html => {
          const qty = html.find('input[name="qty"]').value;
          const keep = html.find('input[name="keep"]').value;
          const keepState = html.find('input[name="keepState"]').value;
          // here is where we set those flags then we want to drawInitiative
          const cards = await this.drawCard(qty, keep);
          combatant.setDrawQty(qty, keep, keepState);
          combatant.setCards(cards);
        },
      },
    };

    const dialog = new Dialog({
      title: game.i18n.format('YZE.Combat.Initiative.DrawQty'),
      content: html,
      buttons: buttons,
      default: {
        qty: 1,
        keep: 1,
        keepState: 'best',
      },
      close: async () => {
        // draw the cards happens on the drawInitiative should not be needed here
      },
    });
    dialog.render(true);
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
    // TODO set all combatants to have no initiative
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
    // TODO advance the turn to the next combatant
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
