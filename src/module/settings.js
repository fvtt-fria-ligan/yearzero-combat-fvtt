// ? scope: world (gm), client (player)
// ? config: true (visible)

import { getCombatantSortOrderModifier } from '@utils/utils.js';
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
    name: 'SETTINGS.InitiativeDeck',
    hint: 'SETTINGS.InitiativeDeckHint',
    scope: 'world',
    config: true,
    type: String,
    default: '',
  });

  game.settings.register(MODULE_ID, CARD_STACK.DISCARD_PILE, {
    name: 'SETTINGS.DiscardPile',
    hint: 'SETTINGS.DiscardPileHint',
    scope: 'world',
    config: true,
    type: String,
    default: '',
  });

  game.settings.register(MODULE_ID, SETTINGS_KEYS.INITIATIVE_SORT_ORDER, {
    name: 'SETTINGS.InitiativeSortOrder',
    hint: 'SETTINGS.InitiativeSortOrderHint',
    scope: 'world',
    config: true,
    type: Number,
    choices: {
      1: 'SETTINGS.InitiativeSortOrderAscending',
      [-1]: 'SETTINGS.InitiativeSortOrderDescending',
    },
    default: 1,
    onChange: _onInitiativeSortOrderChange,
  });

  game.settings.register(MODULE_ID, SETTINGS_KEYS.INITIATIVE_AUTODRAW, {
    name: 'SETTINGS.AutoDraw',
    hint: 'SETTINGS.AutoDrawHint',
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register(MODULE_ID, SETTINGS_KEYS.INITIATIVE_RESET_DECK_ON_START, {
    name: 'SETTINGS.InitiativeResetDeckOnCombatStart',
    hint: 'SETTINGS.InitiativeResetDeckOnCombatStartHint',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register(MODULE_ID, SETTINGS_KEYS.RESET_EACH_ROUND, {
    name: 'SETTINGS.InitiativeResetEachRound',
    hint: 'SETTINGS.InitiativeResetEachRoundHint',
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
    requiresReload: true,
  });

  game.settings.register(MODULE_ID, SETTINGS_KEYS.AUTO_SELECT_BEST_CARD, {
    name: 'SETTINGS.AutoSelectBestCard',
    hint: 'SETTINGS.AutoSelectBestCardHint',
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register(MODULE_ID, SETTINGS_KEYS.INITIATIVE_MESSAGING, {
    name: 'SETTINGS.InitiativeMessaging',
    hint: 'SETTINGS.InitiativeMessagingHint',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register(MODULE_ID, SETTINGS_KEYS.SLOW_AND_FAST_ACTIONS, {
    name: 'SETTINGS.SlowAndFastActions',
    hint: 'SETTINGS.SlowAndFastActionsHint',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true,
    requiresReload: true,
  });

  game.settings.register(MODULE_ID, SETTINGS_KEYS.SINGLE_ACTION, {
    name: 'SETTINGS.SingleAction',
    hint: 'SETTINGS.SingleActionHint',
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
    requiresReload: true,
  });

  game.settings.register(MODULE_ID, SETTINGS_KEYS.DUPLICATE_COMBATANTS_ON_START, {
    name: 'SETTINGS.DuplicateCombatantsOnCombatStart',
    hint: 'SETTINGS.DuplicateCombatantsOnCombatStartHint',
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register(MODULE_ID, SETTINGS_KEYS.ACTOR_SPEED_ATTRIBUTE, {
    name: 'SETTINGS.ActorSpeedAttribute',
    hint: 'SETTINGS.ActorSpeedAttributeHint',
    scope: 'world',
    config: true,
    type: String,
    default: '',
  });

  game.settings.register(MODULE_ID, SETTINGS_KEYS.ACTOR_DRAWSIZE_ATTRIBUTE, {
    name: 'SETTINGS.ActorDrawSizeAttribute',
    hint: 'SETTINGS.ActorDrawSizeAttributeHint',
    scope: 'world',
    config: true,
    type: String,
    default: '',
  });

  game.settings.register(MODULE_ID, SETTINGS_KEYS.MAX_DRAW_SIZE, {
    name: 'SETTINGS.MaxDrawSize',
    hint: 'SETTINGS.MaxDrawSizeHint',
    scope: 'world',
    config: true,
    type: Number,
    range: {
      min: 1,
      max: CONFIG.YZE_COMBAT.ultimateMaxDrawSize,
      step: 1,
    },
    default: CONFIG.YZE_COMBAT.ultimateMaxDrawSize,
  });
}

/** @param {number} _v value */
async function _onInitiativeSortOrderChange(_v) {
  for (const combat of game.combats) {
    const updates = [];
    for (const c of combat.combatants) {
      if (c.groupId) {
        const cv = c.cardValue;
        if (cv && !Number.isInteger(cv)) {
          updates.push({
            _id: c.id,
            [`flags.${MODULE_ID}.cardValue`]: Math.round(cv) + getCombatantSortOrderModifier(),
          });
        }
      }
    }
    if (updates.length) await combat.updateEmbeddedDocuments('Combatant', updates);
  }
}
