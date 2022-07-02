// eslint-disable-next-line max-len
/** @typedef {import('@league-of-foundry-developers/foundry-vtt-types/src/foundry/client/data/documents/combat').InitiativeOptions} InitiativeOptions */
import { duplciateCombatant, getInitiativeDeck, getInitiativeDeckDiscardPile } from '../utils/client-hooks';

export default class YearZeroCombat extends Combat {
  // TODO https://gitlab.com/peginc/swade/-/blob/develop/src/module/documents/SwadeCombat.ts

  /**
   * ok!
   * first we get the ids of all the combatants
   * then we get the initiative deck
   * then we set our message options from the function arguments
   * then we create an empty array for our chat messages
   *
   * compare the length of the initiative deck to the number of combatants*their keepSize
   * if the total keep  number is greater than the length of the initiative deck
   * shuffle the discard into the deck and check again
   * if it still doesn't match the number of combatants, warn the user and return
   *
   * Next we check the module options for the prefered draw type: if it is automatic
   * we use the keepState to determine which cards to keep
   * if it is manual, we present the user with a dialog to select which cards to keep
   *
   * in each case we draw drawSize cards drawTimes times, in each case we either
   * present the dialog or we use the keepState to determine which cards to keep
   *
   * if the number of cards we keep is > than 1 we clone the combatant and assign each
   * clone an initiative for each card we keep. other wise we just assign the combatant
   * and set the initiative to the card value.
   *
   * we then create a chat message with the cards we kept
   *
   * we put the combatant(s) into an updatedCombatant array and the chat message into the chatMessages array
   *
   * once all the combatants have been updated we update the combatant array in the combat
   *
   * then we put all the chat messages from the chatMessages array into the chat
   *
   * finally return the combat (this)
   *
   * @param { messageOptions } options - the message options to use
   * @param { ids } ids - the ids of all the combatants in the combat
   * @override
   **/
  async rollInitiative(ids, options) {
    ids = typeof ids === 'string' ? [ids] : ids;
    const initiativeDeck = getInitiativeDeck(true);
    const { messageOptions } = options;
    const chatMessages = [];
    const cardImage = [];
    const cardName = [];
    const updatedCombatants = [];

    const totalKeep = ids.reduce((acc, id) => {
      const combatant = this.this.combatants.get(id, true);
      return acc + combatant.keepSize * combatant.drawTimes;
    }, 0);

    if (totalKeep > initiativeDeck.availableCards.length) {
      initiativeDeck.recall();
      initiativeDeck.shuffle();
    }

    if (totalKeep > initiativeDeck.availableCards.length) {
      const message = game.i18n.format('YZE.Combat.Initiative.NotEnoughCards', {
        count: totalKeep,
        available: initiativeDeck.availableCards.length,
      });
      ui.notifications.warn(message);
      return this;
    }

    for (const id of ids) {
      const combatant = this.combatants.get(id, true);
      if (combatant.isDefeated) continue;
      const keepState = combatant.keepState;
      const drawSize = combatant.drawSize;
      const drawTimes = combatant.drawTimes;
      const keepSize = combatant.keepSize;

      for (let i = 0; i < drawTimes; i++) {
        const cards = await initiativeDeck.draw(drawSize);
        if (game.settings.get('autoDraw')) {
          if (keepSize > 1) {
            if (keepState === 'best') {
              cards.sort((a, b) => a.data.value - b.data.value);
            }
            else if (keepState === 'worst') {
              cards.sort((a, b) => b.data.value - a.data.value);
            }
            cards.splice(keepSize);
          }
        }
        else {
          const chosenCards = this.selectCards(combatant, cards);
          cards.splice(chosenCards.length);
          for (let j = 0; j < chosenCards.length; j++) {
            cards.splice(j, 1, chosenCards[j]);
          }
        }
        if (cards.length > 1) {
          cards.forEach(card => {
            const clone = duplciateCombatant(combatant);
            clone.setCardValue(card.data.value);
            cardImage.push(card.face.img);
            cardName.push(card.data.name);
            updatedCombatants.push(clone);
          });
        }
        else {
          const card = cards[0];
          const initiative = card?.data.value;
          combatant.setCardValue(initiative);
          cardImage.push(card.face.img);
          cardName.push(card.data.name);
          updatedCombatants.push(combatant);
        }
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
      chatMessages.push(messageData);
    }
    await this.update({ combatants: updatedCombatants.toObject() }, { diff: false });
    this.playInitiativeSound();
    await CONFIG.ChatMessage.documentClass.createDocuments(chatMessages);

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
   * For a draw of cards show the user the results in a
   * dialog and ask if they want to keep the cards.
   * allow them to select which cards to keep.
   * @param {Combatant} combatant
   * @returns {Promise.<void>}
   * @async
   * */
  async selectCards(combatant, cards) {
    const template = 'modules/yze-combat/templates/combat/select-cards.hbs';
    const html = await renderTemplate(template, { data: { combatant: combatant, cards: cards } });
    const keep = [];
    const buttons = {
      ok: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.format('YZE.OK'),
        // eslint-disable-next-line no-shadow
        callback: html => {
          const chosenCards = html.findAll('input[type="checkbox"]:checked');
          const chosenCardsIds = chosenCards.map(card => card.data.id);
          chosenCardsIds.forEach(id => {
            keep.push(cards.find(card => card.id === id));
          });
        },
      },
    };

    return new Promise(resolve => {
      new Dialog({
        title: game.i18n.format('YZE.Combat.SelectCard', {
          name: combatant.token.name,
        }),
        content: html,
        buttons: buttons,
        default: 'ok',
        close: async () => {
          if (!keep) {
            keep.push(cards[0]);
          }
          resolve(keep);
        },
      }).render(true);
    });
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
    for (const combatant of this.combatants) {
      const update = this._getInitResetUpdate(combatant);
      if (update) combatant.data.update(update);
    }
    return this.update(
      { turn: 0, combatants: this.combatants.toObject() },
      { diff: false },
    );
  }

  /** @override */
  async startCombat() {
    const combatantsIds = this.combatants
      .filter(combatant => !combatant.isDefeated && combatant.initiative === null)
      .map(combatant => combatant.id);
    await this.rollInitiative(combatantsIds);
    return super.startCombat();
  }


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
