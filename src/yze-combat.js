/*
 * ============================================================================
 * YEAR ZERO COMBAT
 * ============================================================================
 * Contributing: https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt
 * ============================================================================
 * Source Code License: MIT
 *
 * Foundry License: Foundry Virtual Tabletop End User License Agreement
 *   https://foundryvtt.com/article/license/
 *
 * ============================================================================
 */

import { YZEC } from '@module/config';
import { MODULE_NAME } from '@module/constants';
// import { registerSheets } from '@system/sheets';
import { initializeHandlebars } from '@module/handlebars';
import { registerSystemSettings } from '@module/settings';
import { setupModule } from '@module/setup';
import { YearZeroCombatHook } from '@utils/client-hooks';
import YearZeroCards from './combat/cards';
import YearZeroCombat from './combat/combat';
import YearZeroCombatant from './combat/combatant';
import YearZeroCombatTracker from './sidebar/combat-tracker';

/* ------------------------------------------ */
/*  Foundry VTT Initialization                */
/* ------------------------------------------ */

Hooks.once('init', () => {
  logger.log('YZEC | Initializing the Year Zero Combat Module');

  // Records configuration values.
  CONFIG.YZE_COMBAT = YZEC;
  CONFIG.Combat.documentClass = YearZeroCombat;
  CONFIG.Combatant.documentClass = YearZeroCombatant;
  CONFIG.Cards.documentClass = YearZeroCards;
  CONFIG.Cards.presets = {
    initiative: {
      label: 'YZEC.InitiativeDeckPreset',
      src: `modules/${MODULE_NAME}/cards/initiative-deck.json`,
      type: 'deck',
    },
  };
  CONFIG.ui.combat = YearZeroCombatTracker;

  Hooks.call('yzeCombatInit', YearZeroCombatHook);

  // registerSheets();
  initializeHandlebars();
  registerSystemSettings();
});

/* ------------------------------------------ */
/*  Foundry VTT Ready                         */
/* ------------------------------------------ */

Hooks.once('ready', async () => {
  if (game.user.isGM) {
    await setupModule();
  }

  // TODO Hooks.call('yzeCombatReady');

  console.log('YZEC | READY!');

  // TODO Remove this example before merge

  // This listens for a message from the client called when the user clicks the slow button in the combat tracker.
  Hooks.on(`${MODULE_NAME}.slow-action-button-clicked`, data => {
    console.log('YZEC | Event', data);
    // The hook supplies a socket emit function that can be used to send a message to the server/other clients.
    data.emit({ forGmOnly: 'secret lover' });
  });
  // This listens for a message from the client called when the user clicks the Duplicate button in the combat tracker.
  Hooks.on(`${MODULE_NAME}.combat-tracker-duplicate-button-clicked`, data => {
    console.log('YZEC | Event', data);
    // The hook supplies a socket emit function that can be used to send a message to the server/other clients.
    data.emit({ forGmOnly: 'secret lover' });
  });
  // This listens for a message from any client that sends the socket event.
  game.socket.on(`module.${MODULE_NAME}`, ({ data, options: { forGmOnly } }) => {
    console.log('YZEC | Socket', game.user.isGM ? `hello, ${forGmOnly}` : 'hello regular player', data);
  });
});

/* ------------------------------------------ */
/*  Foundry VTT Hooks (Other)                 */
/* ------------------------------------------ */

// Appends the configured context menu buttons to the combatant context menu.
Hooks.on('getCombatTrackerEntryContext', YearZeroCombatTracker.appendControlsToContextMenu);
