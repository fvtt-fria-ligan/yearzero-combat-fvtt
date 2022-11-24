import { MODULE_ID, CARD_STACK } from './constants';

export async function setupModule() {
  await setupCards(CARD_STACK.INITIATIVE_DECK);
  await setupCards(CARD_STACK.DISCARD_PILE);
}

/**
 * Sets the initiative deck or its discard pile.
 * @param {string} stackType `initiativeDeck` or `initiativeDeckDiscardPile`
 * @returns {Cards|CardsPile}
 * @async
 */
async function setupCards(stackType) {
  // Gets the deck/pile.
  const cardStackId = game.settings.get(MODULE_ID, stackType);
  const cardStack = game.cards.get(cardStackId);

  // Exits early if the deck/pile exists.
  if (cardStack) return cardStack;

  // Otherwise, creates it.
  ui.notifications.info(`YZEC.No${stackType.capitalize()}Found`, { localize: true });

  const cardsCls = getDocumentClass('Cards');
  let preset;
  let data;

  switch (stackType) {
    case CARD_STACK.INITIATIVE_DECK:
      preset = CONFIG.Cards.presets.initiative;
      data = await foundry.utils.fetchJsonWithTimeout(preset.src);
      data.name = game.i18n.localize('YZEC.InitiativeDeckName');
      break;
    case CARD_STACK.DISCARD_PILE:
      data = {
        name: game.i18n.localize('YZEC.InitiativeDeckDiscardPileName'),
        type: 'pile',
      };
      break;
    default:
      throw new TypeError(`Invalid card stack type to setup: ${stackType}`);
  }

  const newCardStack = await cardsCls.create(data);
  await game.settings.set(MODULE_ID, stackType, newCardStack.id);

  if (stackType === CARD_STACK.INITIATIVE_DECK) {
    await newCardStack.shuffle({ chatNotification: false });
  }

  return newCardStack;
}
