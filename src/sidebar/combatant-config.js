import { YZEC } from '@module/config';
import { MODULE_ID } from '@module/constants';
import { getInitiativeDeck, getInitiativeDeckDiscardPile } from '@utils/utils';

/**
 * Modifies the current Combatant Config dialog by injecting custom HTML.
 * Why? => Better compatibility if Foundry changes the template.
 * @param {CombatantConfig} app
 * @param {JQuery.<HTMLElement>} html
 * @param {Object} options
 */
export async function onRenderCombatantConfig(app, html, _options) {
  const combatant = app.object;
  const combat = combatant.combat;

  // Resizes the dialog to fit the new stuff.
  html.css({ height: 'auto' });

  // Removes the old initiative input.
  html.find('input[name=initiative]').parents('div.form-group').remove();

  // Gets the cards.
  const deck = getInitiativeDeck();
  /** @type {Card[]} */
  const cards = deck.cards.contents.sort((a, b) => a.value - b.value);
  const drawnCard = cards.find(c => c.value === combatant.cardValue);
  const [availableCards, discardedCards] = cards
    .filter(c => c.id !== drawnCard?.id)
    .partition(c => c.drawn);

  // Injects custom HTML.
  const template = `modules/${MODULE_ID}/templates/sidebar/combatant-cards-config.hbs`;
  const content = await renderTemplate(template, {
    drawnCard,
    availableCards,
    discardedCards,
    drawSize: combatant.drawSize,
    keepState: combatant.keepState,
    speed: combatant.getSpeedFromActor(),
    inGroup: !!combatant.groupId,
    leaderName: combatant.getLeader()?.name,
    config: YZEC,
  });
  html.find('footer').before(content);

  // Adds a new event listener to the button for updating.
  html.find('footer button').on('click', async () => {
    const selectedCard = html.find('select#initiative-card')[0];
    if (!selectedCard) return;
    const cardValue = Number(selectedCard.value);
    const card = cards.find(c => c.value === cardValue);
    if (!card) return;
    if (card.id === drawnCard?.id) return;

    await card.discard(getInitiativeDeckDiscardPile({ strict: true }), { chatNotification: false });

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
          [`flags.${MODULE_ID}.cardValue`]: card.value + 0.01,
          ...updateData,
        });
      }
    }

    await combat.updateEmbeddedDocuments('Combatant', updates);
  });
}
