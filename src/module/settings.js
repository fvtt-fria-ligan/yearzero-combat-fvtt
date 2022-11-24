// ? scope: world (gm), client (player)
// ? config: true (visible)

import { CARD_STACK, MODULE_ID, SETTINGS_KEYS } from './constants.js';

export function registerSystemSettings() {

  game.settings.register(MODULE_ID, SETTINGS_KEYS.MIGRATION_VERSION, {
    name: 'Module Migration Version',
    scope: 'world',
    config: false,
    type: String,
    default: '0.0.0',
  });

  game.settings.register(MODULE_ID, CARD_STACK.INITIATIVE_DECK, {
    name: 'Initiative Deck ID',
    scope: 'world',
    config: false,
    type: String,
    default: '',
  });

  game.settings.register(MODULE_ID, CARD_STACK.DISCARD_PILE, {
    name: 'Initiative Deck Discard Pile ID',
    scope: 'world',
    config: false,
    type: String,
    default: '',
  });

  game.settings.register(MODULE_ID, SETTINGS_KEYS.AUTODRAW, {
    name: 'SETTINGS.AutoDrawN',
    hint: 'SETTINGS.AutoDrawH',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true,
  });
}
