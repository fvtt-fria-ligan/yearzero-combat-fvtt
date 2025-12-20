/* ------------------------------------------ */
/*  COMBATANT CONFIG                          */
/*   Original author: FloRad (SWADE system)   */
/*   https://gitlab.com/peginc/swade          */
/* ------------------------------------------ */

import { YZEC } from '@module/config';
import { MODULE_ID, SETTINGS_KEYS } from '@module/constants';
import * as Utils from '@utils/utils';

/**
 * Modifies the current Combatant Config dialog by injecting custom HTML.
 * Why? => Better compatibility if Foundry changes the template.
 * @param {CombatantConfig} app
 * @param {JQuery.<HTMLElement>} html
 * @param {Object} options
 */
export async function onRenderCombatantConfig(app, html, _options) {
  const combatant = app.document;
  const combat = combatant.combat;

  // Resizes the dialog to fit the new stuff.
  html.style.height = 'auto';

  // Removes the old initiative input.
  const inputElement = html.querySelector('input[name=initiative]');
  let inputParent = inputElement.parentNode;
  while (inputParent) {
    if (inputParent.matches('div.form-group')) {
      inputParent.remove();
      break;
    }
    inputParent = inputParent.parentNode;
  }

  // Gets the cards.
  const deck = Utils.getInitiativeDeck();
  /** @type {Card[]} */
  const cards = deck.cards.contents.sort((a, b) => (a.value - b.value) * Utils.getCardSortOrderModifier());
  const drawnCard = cards.find(c => c.value === combatant.cardValue);
  const [availableCards, discardedCards] = cards
    .filter(c => c.id !== drawnCard?.id)
    .partition(c => c.drawn);

  // Injects custom HTML.
  const footer = html.querySelector('footer');
  const template = `modules/${MODULE_ID}/templates/sidebar/combatant-cards-config.hbs`;
  const customHTML = document.createElement('div');

  customHTML.innerHTML = await foundry.applications.handlebars.renderTemplate(template, {
    combatant,
    drawnCard,
    availableCards,
    discardedCards,
    drawSize: combatant.drawSize,
    keepState: combatant.keepState,
    speed: combatant.getSpeedFromActor(),
    inGroup: !!combatant.groupId,
    leaderName: combatant.getLeader()?.name,
    maxDrawSize: Math.min(YZEC.ultimateMaxDrawSize, game.settings.get(MODULE_ID, SETTINGS_KEYS.MAX_DRAW_SIZE)),
    config: YZEC,
  });
  footer.before(customHTML);

  // Adds a new event listener to the button for updating.
  const buttonElement = footer.querySelector('button');
  buttonElement.addEventListener('click', async () => {
    const selectedCard = html.querySelector('select#initiative-card');
    if (!selectedCard) return;
    const cardValue = Number(selectedCard.value);
    const card = cards.find(c => c.value === cardValue);
    if (!card) return;
    if (card.id === drawnCard?.id) return;

    await card.discard(Utils.getInitiativeDeckDiscardPile({ strict: true }), { chatNotification: false });

    const updateData = {
      initiative: card.value,
      [`flags.${MODULE_ID}.cardName`]: card.description || card.name,
    };

    const updates = [{
      _id: combatant.id,
      [`flags.${MODULE_ID}.cardValue`]: card.value,
      ...updateData,
    }];

    if (combatant.isGroupLeader) {
      for (const f of combatant.getFollowers()) {
        updates.push({
          _id: f.id,
          [`flags.${MODULE_ID}.cardValue`]: card.value + Utils.getCombatantSortOrderModifier(),
          ...updateData,
        });
      }
    }

    await combat.updateEmbeddedDocuments('Combatant', updates);
  });
}
