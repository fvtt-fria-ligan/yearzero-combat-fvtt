// ? scope: world (gm), client (player)
// ? config: true (visible)

import { CARD_STACK, MODULE_NAME, SETTINGS_KEYS } from './constants.js';

export function registerSystemSettings() {

  game.settings.register(MODULE_NAME, SETTINGS_KEYS.MIGRATION_VERSION, {
    name: 'Module Migration Version',
    scope: 'world',
    config: false,
    type: String,
    default: '0.0.0',
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
    onChange: debouncedReload,
  });

  game.settings.register(MODULE_NAME, SETTINGS_KEYS.SLOW_AND_FAST_ACTIONS, {
    name: 'SETTINGS.SlowAndFastActionsN',
    hint: 'SETTINGS.SlowAndFastActionsL',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true,
    onChange: debouncedReload,
  });
}

/**
 * Refreshes the Foundry window.
 * (Triggered by some settings with property `onChange`.)
 */
const debouncedReload = foundry.utils.debounce(() => window.location.reload(), 100);
