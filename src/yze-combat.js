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
 * Greatly inspired by FloRad's SWADE's initiative cards combat system
 *   https://gitlab.com/peginc/swade
 *
 * ============================================================================
 */

import YearZeroCards from '@combat/cards';
import YearZeroCombat from '@combat/combat';
import YearZeroCombatant from '@combat/combatant';
import { addSlowAndFastStatusEffects, addSingleActionStatusEffect } from '@combat/slow-and-fast-actions';
import { YZEC } from '@module/config';
import { HOOKS_KEYS, MODULE_ID, SETTINGS_KEYS } from '@module/constants';
import { initializeHandlebars } from '@module/handlebars';
import { registerSystemSettings } from '@module/settings';
import { setupModule } from '@module/setup';
import YearZeroCombatHook from '@utils/client-hooks';
import YearZeroCombatTracker from './sidebar/combat-tracker';
import { onRenderCombatantConfig } from './sidebar/combatant-config';

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
      src: `modules/${MODULE_ID}/cards/initiative-deck.json`,
      type: 'deck',
    },
  };
  CONFIG.ui.combat = YearZeroCombatTracker;

  initializeHandlebars();
  registerSystemSettings();

  // Calls the configuration hook.
  Hooks.callAll(HOOKS_KEYS.YZEC_INIT, YearZeroCombatHook);
});

/* ------------------------------------------ */
/*  Foundry VTT Ready                         */
/* ------------------------------------------ */

Hooks.once('ready', async () => {
  if (game.user.isGM) {
    await setupModule();
  }
  if (game.settings.get(MODULE_ID, SETTINGS_KEYS.SLOW_AND_FAST_ACTIONS)) {
    addSlowAndFastStatusEffects();
  }
  if (game.settings.get(MODULE_ID, SETTINGS_KEYS.SINGLE_ACTION)) {
    addSingleActionStatusEffect();
  }

  console.log('YZEC | Ready!');

  // Calls the configuration hook.
  Hooks.callAll(HOOKS_KEYS.YZEC_READY, YearZeroCombatHook);

  // // This listens for a message from the client called when the user clicks the slow button in the combat tracker.
  // Hooks.on(`${MODULE_ID}.slow-action-button-clicked`, data => {
  //   console.log('YZEC | Event', data);
  //   // The hook supplies a socket emit function that can be used to send a message to the server/other clients.
  //   data.emit({ forGmOnly: 'secret lover' });
  // });
  // // This listens for a message from any client that sends the socket event.
  // game.socket.on(`module.${MODULE_ID}`, ({ data, options: { forGmOnly } }) => {
  //   console.log('YZEC | Socket', game.user.isGM ? `hello, ${forGmOnly}` : 'hello regular player', data);
  // });
});

/* ------------------------------------------ */
/*  Foundry VTT Hooks (Other)                 */
/* ------------------------------------------ */

// Appends the configured context menu buttons to the combatant context menu.
Hooks.on('getCombatTrackerEntryContext', YearZeroCombatTracker.appendControlsToContextMenu);

// Injects custom HTML in the combatant config.
Hooks.on('renderCombatantConfig', onRenderCombatantConfig);

Hooks.on('createCombatant', YearZeroCombat.createCombatant);
