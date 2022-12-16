// eslint-disable-next-line max-len
/** @typedef {import('@league-of-foundry-developers/foundry-vtt-types/src/foundry/client/data/documents/combat').InitiativeOptions} InitiativeOptions */
/** @typedef {import('./combatant').default} YearZeroCombatant */

import { CARDS_DRAW_KEEP_STATES, MODULE_ID, SETTINGS_KEYS } from '@module/constants';
import { duplicateCombatant, getInitiativeDeck, getInitiativeDeckDiscardPile } from '@utils/utils';

export default class YearZeroCombat extends Combat {

  /**
   * @see {@link https://gitlab.com/peginc/swade/-/blob/develop/src/module/documents/SwadeCombat.ts}
   * @param {string|string[]}    ids      The IDs of all the combatants in the combat
   * @param {InitiativeOptions} [options] Additional initiative options
   * @override
   */
  async rollInitiative(ids, options = {}) {
    // Structures data.
    if (!Array.isArray(ids)) ids = [ids];
    const { messageOptions } = options;
    const messages = [];
    const skipMessage = false;
    const initiativeDeck = getInitiativeDeck(true);
    //     ids = typeof ids === 'string' ? [ids] : ids;
    //     const initiativeDeck = getInitiativeDeck(true);
    //     const { messageOptions } = options;
    //     const chatMessages = [];
    //     const cardImage = [];
    //     const cardName = [];
    //     const updatedCombatants = [];

    //     const totalKeep = ids.reduce((acc, id) => {
    //       const combatant = this.combatants.get(id, true);
    //       return acc + combatant.keepSize * combatant.drawTimes;
    //     }, 0);

    //     if (totalKeep > initiativeDeck.availableCards.length) {
    //       await initiativeDeck.recall();
    //       await initiativeDeck.shuffle();
    //     }

    //     if (totalKeep > initiativeDeck.availableCards.length) {
    //       const message = game.i18n.format('YZEC.Combat.Initiative.NotEnoughCards', {
    //         count: totalKeep,
    //         available: initiativeDeck.availableCards.length,
    //       });
    //       ui.notifications.warn(message);
    //       return this;
    //     }

    // Iterates over each combatant.
    for (const id of ids) {
      /** @type {YearZeroCombatant} */
      const combatant = this.combatants.get(id, { strict: true });
      const inGroup = !!combatant.groupId;

      if (combatant.isDefeated || inGroup) continue;

      // Checks if enough cards are available.
      const cardsToDraw = combatant.getNumberOfCardsToDraw();
      if (cardsToDraw > initiativeDeck.availableCards.length) {
        ui.notifications.info('YZEC.Combat.Initiative.NotEnoughCards', { localize: true });
        await initiativeDeck.recall();
        await initiativeDeck.shuffle();
      }

      // Draws the cards.
      /** @type {Card} */
      let card;
      const cards = await this.drawCards(cardsToDraw);

      // FIXME DEBUG
      if (cards.length !== cardsToDraw) console.warn('Something went wrong: Incorrect number of cards drawn');

      if (cards.length > 1) {
        cards.sort((a, b) => a.value - b.value);

        if (game.settings.get(MODULE_ID, SETTINGS_KEYS.INITIATIVE_AUTODRAW)) {
          switch (combatant.keepState) {
            default:
            case CARDS_DRAW_KEEP_STATES.BEST:
              card = cards[0];
              break;
            case CARDS_DRAW_KEEP_STATES.WORST:
              card = cards.at(-1);
              break;
          }
        }
        else {
          const chosenCard = await this.chooseCard(cards, combatant);
          card = chosenCard ?? cards[0];
        }
      }
      else {
        card = cards[0];
      }

      // Updates the combatant.
      const updateData = {
        initiative: card.value,
        [`flags.${MODULE_ID}.cardValue`]: card.value,
        [`flags.${MODULE_ID}.cardDescription`]: card.description,
      };
      await combatant.updateSource(updateData);

      // Updates other combatants in the group.
      if (combatant.isGroupLeader) {
        const followers = game.combat.combatants.filter(f => f.groupId === id);
        for (const follower of followers) {
          await follower.updateSource(updateData);
        }
      }

      // Prepares the messages.
      const template = `modules/${MODULE_ID}/templates/chat/draw-initiative-chatcard.hbs`;
      const content = await renderTemplate(template, { card });

      const speakerData = {
        scene: game.scenes?.active?.id,
        actor: combatant.actor?.id,
        token: combatant.token?.id,
        alias: game.i18n.format('YZEC.Combat.Initiative.Draw', {
          name: combatant.token?.name ?? '???',
        }),
      };

      const messageData = foundry.utils.mergeObject({
        content,
        speaker: speakerData,
        whisper: combatant.token?.hidden || combatant.hidden
          ? game.users.filter(u => u.isGM)
          : [],
      }, messageOptions);

      messages.push(messageData);
    }

    // Updates the combat instance with the new combatants.
    await this.update(
      { combatants: this.combatants.toObject() },
      { diff: false },
    );

    // Creates multiple chat messages.
    if (!skipMessage) {
      this._playInitiativeSound(); // No need to await
    }
    if (!skipMessage && game.settings.get(MODULE_ID, SETTINGS_KEYS.INITIATIVE_MESSAGING)) {
      await CONFIG.ChatMessage.documentClass.createDocuments(messages);
    }

    return this;

    //     for (const id of ids) {
    //       const combatant = this.combatants.get(id, true);
    //       if (combatant.isDefeated) continue;
    //       const keepState = combatant.keepState || 'best';
    //       const drawSize = combatant.drawSize || 1;
    //       const drawTimes = combatant.drawTimes || 1;
    //       const keepSize = combatant.keepSize || 1;

    //       for (let i = 0; i < drawTimes; i++) {
    //         const cards = await this.drawCard(drawSize);
    //         if (game.settings.get(MODULE_ID, SETTINGS_KEYS.AUTODRAW)) {
    //           if (keepSize > 1) {
    //             if (keepState === 'best') {
    //               cards.sort((a, b) => a.value - b.value);
    //             }
    //             else if (keepState === 'worst') {
    //               cards.sort((a, b) => b.value - a.value);
    //             }
    //             cards.splice(keepSize);
    //           }
    //         }
    //         else {
    //           const chosenCards = await this.selectCards(combatant, cards);
    //           cards.splice(chosenCards.length);
    //           for (let j = 0; j < chosenCards.length; j++) {
    //             cards.splice(j, 1, chosenCards[j]);
    //           }
    //         }
    //         if (cards.length > 1) {
    //           cards.forEach(card => {
    //             const clone = duplicateCombatant(combatant);
    //             clone.setCardValue(card.value);
    //             cardImage.push(card.face.img);
    //             cardName.push(card.name);
    //             updatedCombatants.push(clone);
    //           });
    //         }
    //         else {
    //           const card = cards[0];
    //           const initiative = card?.value;
    //           combatant.setCardValue(initiative);
    //           cardImage.push(card.face.img);
    //           cardName.push(card.name);
    //           updatedCombatants.push(combatant);
    //         }
    //       }
    //       const template = `
    // <section class="initiative-card">
    //   <div class="initiative-card-container">
    //     ${cardImage.map(img => `<img class="initiative-card-image" src="${img}"/>`).join(' ')}
    //   </div>
    //   <div class="initiative-card-name-container">
    //     ${cardName.map(card => `<div class="result-text result-text-card">${card}</div>`).join(' ')}
    //   </div>
    // </section>`;

    //       const messageData = mergeObject(
    //         {
    //           speaker: {
    //             scene: game.scenes?.active?.id,
    //             actor: combatant.actor ? combatant.actor.id : null,
    //             token: combatant.token?.id,
    //             alias: game.i18n.format('YZEC.Combat.Initiative.Draw', { name: combatant.token.name }),
    //           },
    //           whisper: combatant.token?.hidden || combatant.hidden ? game?.users?.filter(user => user.isGM) : [],
    //           content: template,
    //         },
    //         messageOptions,
    //       );
    //       chatMessages.push(messageData);
    //     }
    //     await this.update({ combatants: updatedCombatants }, { diff: false });
    //     this.playInitiativeSound();
    //     await CONFIG.ChatMessage.documentClass.createDocuments(chatMessages);

    //     return this;
  }

  /* ------------------------------------------ */

  /**
   * Draws cards from the Initiative deck.
   * @param {number} [qty=1] Quantity of cards to draw
   * @returns {Promise.<Card[]>}
   */
  async drawCards(qty = 1) {
    const initiativeDeck = getInitiativeDeck(true);
    const discardPile = getInitiativeDeckDiscardPile(true);
    return initiativeDeck.drawInitiative(discardPile, qty);
  }

  /* ------------------------------------------ */

  /**
   * Picks an initiative card for a combatant.
   * @param {Cards[]}           cards     (Already sorted)
   * @param {YearZeroCombatant} combatant
   * @returns {Promise.<Card>}
   */
  async chooseCard(cards, combatant) {
    const template = `modules/${MODULE_ID}/templates/combat/choose-card-dialog.hbs`;
    const content = await renderTemplate(template, { cards });
    const buttons = {
      ok: {
        icon: '<i class="fas fa-check"></i>',
        label: 'OK',
        // callback: () => {},
      },
    };

    /**
     * @see {@link https://foundryvtt.com/api/classes/client.Dialog.html#wait}
     */
    return Dialog.wait({
      title: `${combatant.name}: ${game.i18n.localize('YZEC.Combat.Initiative.ChooseCard')}`,
      content, buttons,
      default: 'ok',
      close: html => {
        const choice = html.find('input[name=card]:checked');
        const cardId = choice.data('card-id');
        return cards.find(c => c.id === cardId);
      },
    }, {
      classes: ['dialog', MODULE_ID, game.system.id],
    }, {});
  }

  /* ------------------------------------------ */


  /**
   * Shows a dialog asking how many cards to draw:
   * - Ask the user to choose how many cards to keep
   * - Ask the user if they keep best or worse
   * - Draw the cards based on their input
   * @param {YearZeroCombatant} combatant
   * @returns {Promise.<void>}
   */
  // async setDrawQty(combatant) {
  //   const template = `modules/${MODULE_ID}/templates/combat/set-draw-qty.hbs`;
  //   const content = await renderTemplate(template, { data: { combatant: combatant } });
  //   const buttons = {
  //     draw: {
  //       label: game.i18n.localize('YZEC.Combat.Draw'),
  //       callback: async html => {
  //         const qty = html.find('input[name="qty"]').value;
  //         const keep = html.find('input[name="keep"]').value;
  //         const keepState = html.find('input[name="keepState"]').value;
  //         // here is where we set those flags then we want to drawInitiative
  //         const cards = await this.drawCards(qty, keep);
  //         combatant.setDrawQty(qty, keep, keepState);
  //         combatant.setCards(cards);
  //       },
  //     },
  //   };

  // return Dialog.wait({
  //   title: game.i18n.localize('YZEC.Combat.Initiative.DrawQty'),
  //   content,
  //   buttons,
  //   default: {
  //     qty: 1,
  //     keep: 1,
  //     keepState: 'best',
  //   },
  //   // Draw the cards happens on the drawInitiative should not be needed here.
  //   // close: async () => {},
  // });

  // const dialog = new Dialog({
  //   title: game.i18n.localize('YZEC.Combat.Initiative.DrawQty'),
  //   content,
  //   buttons: buttons,
  //   default: {
  //     qty: 1,
  //     keep: 1,
  //     keepState: 'best',
  //   },
  //   close: async () => {
  //     // draw the cards happens on the drawInitiative should not be needed here
  //   },
  // });
  // dialog.render(true);
  // }

  /* ------------------------------------------ */

  // /**
  //  * For a draw of cards show the user the results in a
  //  * dialog and ask if they want to keep the cards.
  //  * allow them to select which cards to keep.
  //  * @param {YearZeroCombatant} combatant
  //  * @param {Cards[]}   cards
  //  * @returns {Promise.<void>}
  //  */
  // async selectCards(combatant, cards) {
  //   const template = `modules/${MODULE_ID}/templates/combat/select-cards.hbs`;
  //   const content = await renderTemplate(template, { data: { combatant: combatant, cards: cards } });
  //   const keep = [];
  //   const buttons = {
  //     ok: {
  //       icon: '<i class="fas fa-check"></i>',
  //       label: game.i18n.format('YZEC.OK'),
  //       callback: html => {
  //         const chosenCards = html.findAll('input[type="checkbox"]:checked');
  //         const chosenCardsIds = chosenCards.map(card => card.id);
  //         chosenCardsIds.forEach(id => {
  //           keep.push(cards.find(card => card.id === id));
  //         });
  //       },
  //     },
  //   };

  //   return Dialog.wait({
  //     title: game.i18n.format('YZEC.Combat.SelectCard', {
  //       name: combatant.token.name,
  //     }),
  //     content,
  //     buttons,
  //     default: 'ok',
  //     close: async () => {
  //       if (!keep) keep.push(cards[0]);
  //       return keep;
  //     },
  //   });

  //   // return new Promise(resolve => {
  //   //   new Dialog({
  //   //     title: game.i18n.format('YZEC.Combat.SelectCard', {
  //   //       name: combatant.token.name,
  //   //     }),
  //   //     content: html,
  //   //     buttons: buttons,
  //   //     default: 'ok',
  //   //     close: async () => {
  //   //       if (!keep) {
  //   //         keep.push(cards[0]);
  //   //       }
  //   //       resolve(keep);
  //   //     },
  //   //   }).render(true);
  //   // });
  // }

  /* ------------------------------------------ */

  /**
   * Finds a specific card in the deck.
   * @param {number} cardValue
   * @returns {Card|undefined}
   */
  findCard(cardValue) {
    const initiativeDeck = getInitiativeDeck(true);
    return initiativeDeck.cards.find(c => c.value === cardValue);
  }

  /* ------------------------------------------ */

  /**
   * Duplicates a combatant
   * @param {Combatant} combatant Combatant to duplicate
   * @param {number}   [qty=1]    Number of times to duplicate it
   * @returns {Promise.<Combatant[]>}
   */
  async duplicateCombatant(combatant, qty = 1) {
    const combatants = new Array(qty).fill(combatant);
    return this.createEmbeddedDocuments('Combatant', combatants);
  }

  /* ------------------------------------------ */
  /* Overridden Base Methods                    */
  /* ------------------------------------------ */

  /**
   * Sorts the combatants by initiative ascending order (low to high).
   * @param {YearZeroCombatant} a
   * @param {YearZeroCombatant} b
   * @override
   */
  _sortCombatants(a, b) {
    if (!a || !b) return 0;
    // Sorts by card value:
    if (a.flags[MODULE_ID] && a.flags[MODULE_ID]) {
      if (a.cardValue < b.cardValue) return -1;
      if (a.cardValue > b.cardValue) return 1;
      return 0;
    }
    // Sorts by name otherwise:
    else {
      const cn = a.name.localeCompare(b.name);
      if (cn !== 0) return cn;
      return a.id.localeCompare(b.id);
    }
  }

  /* ------------------------------------------ */

  /** @override */
  async resetAll() {
    for (const combatant of this.combatants) {
      await combatant.resetInitiative();
    }
    return this.update(
      { turn: 0, combatants: this.combatants.toObject() },
      { diff: false },
    );
  }

  /* ------------------------------------------ */

  /** @override */
  async startCombat() {
    // Duplicate actors if needed.
    for (const combatant of this.combatants) {
      const speed = combatant.getSpeedFromActor();
      if (speed > 1) {
        const clone = duplicateCombatant(combatant);
        this.combatants.set(clone.id, clone);
      }
    }
    // Draws initiative for everyone.
    const ids = this.combatants
      .filter(c => !c.isDefeated && c.initiative === null)
      .map(c => c.id);
    await this.rollInitiative(ids);
    return super.startCombat();
  }

  /* ------------------------------------------ */
  /*  Utility Methods                           */
  /* ------------------------------------------ */

  /**
   * Plays a *drawing card* sound.
   * @private
   */
  async _playInitiativeSound() {
    const data = {
      src: `modules/${MODULE_ID}/assets/sounds/card-flip.wav`,
      volume: 0.75,
      autoplay: true,
      loop: false,
    };
    return AudioHelper.play(data);
  }

}
