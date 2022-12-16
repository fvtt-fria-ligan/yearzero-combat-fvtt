/**
 * These values should never be changed!
 */

/** @enum {string} */
export const MODULE_ID = 'yze-combat';

/** @enum {string} */
export const CARD_STACK = {
  /** @type {'initiativeDeck'} */ INITIATIVE_DECK: 'initiativeDeck',
  /** @type {'initiativeDeckDiscardPile'} */ DISCARD_PILE: 'initiativeDeckDiscardPile',
};

/** @enum {string} */
export const CARDS_DRAW_KEEP_STATES = {
  /** @type {'best'} */ BEST: 'best',
  /** @type {'worst'} */ WORST: 'worst',
};

/** @enum {string} */
export const SETTINGS_KEYS = {
  /** @type {'moduleMigrationVersion'} */ MIGRATION_VERSION: 'moduleMigrationVersion',
  /** @type {'actorSpeedAttribute'} */ ACTOR_SPEED_ATTRIBUTE: 'actorSpeedAttribute',
  /** @type {'initAutoDraw'} */ INITIATIVE_AUTODRAW: 'initAutoDraw',
  /** @type {'initMessaging'} */ INITIATIVE_MESSAGING: 'initMessaging',
  /** @type {'initResetDeckOnCombatStart'} */ INITIATIVE_RESET_DECK_ON_START: 'initResetDeckOnCombatStart',
};

/** @enum {string} */
export const HOOKS_KEYS = {
  /** @type {'yzeCombatInit'} */ COMBAT_INIT: 'yzeCombatInit',
};
