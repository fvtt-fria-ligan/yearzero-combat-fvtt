// ? scope: world (gm), client (player)
// ? config: true (visible)

import { CARD_STACK, MODULE_NAME } from './constants.js';

export function registerSystemSettings() {

  game.settings.register(MODULE_NAME, 'moduleMigrationVersion', {
    name: 'Module Migration Version',
    scope: 'world',
    config: false,
    type: String,
    default: '',
  });

  game.settings.register(MODULE_NAME, CARD_STACK.INITIATIVE_DECK, {
    name: 'Initiative Deck ID',
    scope: 'world',
    config: false,
    type: String,
    default: '',
  });

  game.settings.register(MODULE_NAME, CARD_STACK.DISCARD_PILE, {
    name: 'Initiative Deck Discard Pile ID',
    scope: 'world',
    config: false,
    type: String,
    default: '',
  });

  game.settings.register(MODULE_NAME, 'autoDraw', {
    name: 'Default Inititive Draw Mode',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true,
  });
}
