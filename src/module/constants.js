/**
 * These values should never be changed!
 */

/** @enum {string} */
export const MODULE_ID = 'yze-combat';

/** @enum {string} */
export const CARD_STACK = {
  INITIATIVE_DECK: 'initiativeDeck',
  DISCARD_PILE: 'initiativeDeckDiscardPile',
};

/** @enum {string} */
export const CARDS_DRAW_KEEP_STATES = {
  BEST: 'best',
  WORST: 'worst',
};

/** @enum {string} */
export const SETTINGS_KEYS = {
  MIGRATION_VERSION: 'moduleMigrationVersion',
  ACTOR_SPEED_ATTRIBUTE: 'actorSpeedAttribute',
  INITIATIVE_AUTODRAW: 'initAutoDraw',
  INITIATIVE_MESSAGING: 'initMessaging',
};

/** @enum {string} */
export const HOOKS_KEYS = {
  COMBAT_INIT: 'yzeCombatInit',
};
