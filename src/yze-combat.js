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
import YearZeroCards from './combat/cards';
import YearZeroCombat from './combat/combat';
import YearZeroCombatant from './combat/combatant';
import YearZeroCombatTracker from './sidebar/combat-tracker';

/* ------------------------------------------ */
/*  Foundry VTT Initialization                */
/* ------------------------------------------ */

Hooks.once('init', () => {
  logger.log('YZEC | Initializing the Year Zero Combat Module');

  // ! Hooks.call('yzeCombatInit');
  // ! Hooks.call('yzeCombatReady');

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

  // registerSheets();
  initializeHandlebars();
  registerSystemSettings();
});

/* ------------------------------------------ */
/*  Foundry VTT Ready                         */
/* ------------------------------------------ */

Hooks.once('ready', () => {
  console.log('YZEC | READY!');
});

/* ------------------------------------------ */
/*  Foundry VTT Hooks (Other)                 */
/* ------------------------------------------ */
