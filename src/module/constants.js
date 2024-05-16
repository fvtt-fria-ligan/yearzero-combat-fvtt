/**
 * These values should never be changed!
 */

/** @enum {string} */
export const MODULE_ID = 'yze-combat';

/** @enum {string} */
export const MODULE_FLAGS = `flags.${MODULE_ID}`;

/** @enum {string} */
export const CARD_STACK = {
  /** @type {'initiativeDeck'} */ INITIATIVE_DECK: 'initiativeDeck',
  /** @type {'initiativeDeckDiscardPile'} */ DISCARD_PILE: 'initiativeDeckDiscardPile',
};

/** @enum {string} */
export const STATUS_EFFECTS = {
  FAST_ACTION: 'fastAction',
  SLOW_ACTION: 'slowAction',
  SINGLE_ACTION: 'action',
};

/** @enum {string} */
export const CARDS_DRAW_KEEP_STATES = {
  /** @type {'best'} */ BEST: 'best',
  /** @type {'worst'} */ WORST: 'worst',
};

/** @enum {string} */
export const SETTINGS_KEYS = {
  /** @type {'moduleMigrationVersion'} */ MIGRATION_VERSION: 'moduleMigrationVersion',
  /** @type {'actorDrawSizeAttribute'} */ ACTOR_DRAWSIZE_ATTRIBUTE: 'actorDrawSizeAttribute',
  /** @type {'actorSpeedAttribute'} */ ACTOR_SPEED_ATTRIBUTE: 'actorSpeedAttribute',
  /** @type {'duplicateCombatantOnCombatStart'} */ DUPLICATE_COMBATANTS_ON_START: 'duplicateCombatantOnCombatStart',
  /** @type {'initAutoDraw'} */ INITIATIVE_AUTODRAW: 'initAutoDraw',
  /** @type {'initMessaging'} */ INITIATIVE_MESSAGING: 'initMessaging',
  /** @type {'initResetDeckOnCombatStart'} */ INITIATIVE_RESET_DECK_ON_START: 'initResetDeckOnCombatStart',
  /** @type {'initSortOrder'} */ INITIATIVE_SORT_ORDER: 'initSortOrder',
  /** @type {'maxDrawSize'} */ MAX_DRAW_SIZE: 'maxDrawSize',
  /** @type {'slowAndFastActions'} */ SLOW_AND_FAST_ACTIONS: 'slowAndFastActions',
  /** @type {'singleAction'} */ SINGLE_ACTION: 'singleAction',
  /** @type {'resetEachRound'} */ RESET_EACH_ROUND: 'resetEachRound',
  /** @type {'autoSelectBestCard'} */ AUTO_SELECT_BEST_CARD: 'autoSelectBestCard',
};

/** @enum {string} */
export const HOOKS_KEYS = {
  /** @type {'yzeCombatInit'} */ YZEC_INIT: 'yzeCombatInit',
  /** @type {'yzeCombatReady'} */ YZEC_READY: 'yzeCombatReady',
};
