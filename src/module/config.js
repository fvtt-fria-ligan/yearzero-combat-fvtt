import { CARDS_DRAW_KEEP_STATES, MODULE_ID, STATUS_EFFECTS } from './constants.js';

/**
 * The Year Zero Engine Combat configuration.
 * @constant
 * @enum
 */
export const YZEC = {};

YZEC.CombatTracker = {
  src: `modules/${MODULE_ID}/sidebar/combat-tracker.config.json`,
  // config: undefined,
  DefaultCombatantControls: {
    slowAndFastActions: [
      {
        eventName: 'fast-action-button-clicked',
        icon: 'fa-forward',
        id: 'fast-action-button',
        property: 'fastAction',
        label: 'YZEC.CombatTracker.FastAction',
        visibility: 'owner',
      },
      {
        eventName: 'slow-action-button-clicked',
        icon: 'fa-play',
        id: 'slow-action-button',
        property: 'slowAction',
        label: 'YZEC.CombatTracker.SlowAction',
        visibility: 'owner',
      },
    ],
    singleAction: [
      {
        eventName: 'single-action-button-clicked',
        icon: 'fa-play',
        id: 'single-action-button',
        property: 'action',
        label: 'YZEC.CombatTracker.SingleAction',
        visibility: 'owner',
      },
    ],
    lockInitiative: [
      {
        eventName: 'lock-initiative-button-clicked',
        label: 'YZEC.CombatTracker.lockInitiative',
        icon: 'fas fa-lock',
        id: 'lock-initiative-button',
        property: 'lockInitiative',
        visibility: 'owner',
        condition: (combat, combatant) => {
          const combatHasBegun = combat.active && combat.started;
          const notInGroup = !combatant.groupId;
          return combatHasBegun && notInGroup;
        },
      },
    ],
  },
};

YZEC.ultimateMaxDrawSize = 3;
YZEC.defaultGroupColor = '#efefef';
YZEC.defeatedGroupColor = '#fff';

YZEC.keepStates = Object.values(CARDS_DRAW_KEEP_STATES).reduce((o, v) => {
  o[v] = `YZEC.CombatantConfig.KeepState${v.capitalize()}`;
  return o;
}, {});

/* ------------------------------------------ */
/*  Status Effects                            */
/* ------------------------------------------ */

YZEC.StatusEffects = {
  slowAndFastActions: [
    {
      id: STATUS_EFFECTS.FAST_ACTION,
      label: 'YZEC.CombatTracker.FastAction',
      icon: `modules/${MODULE_ID}/assets/icons/fast-action.svg`,
      statuses: ['fastAction'],
    },
    {
      id: STATUS_EFFECTS.SLOW_ACTION,
      label: 'YZEC.CombatTracker.SlowAction',
      icon: `modules/${MODULE_ID}/assets/icons/slow-action.svg`,
      statuses: ['slowAction'],
    },
  ],
  singleAction: {
    id: STATUS_EFFECTS.SINGLE_ACTION,
    label: 'YZEC.CombatTracker.SingleAction',
    icon: `modules/${MODULE_ID}/assets/icons/slow-action.svg`,
    statuses: ['action'],
  },
};

/* ------------------------------------------ */
/*  Icons                                     */
/* ------------------------------------------ */

/**
 * List of available icons.
 * @see {@link https://fontawesome.com/v5/search?m=free|Font Awesome V5 Free Icons}
 * @example
 * // Handlebars template (howto)
 * // Note: { } x3
 * <div>{{{@root.config.Icons.xxx}}}</div>
 */
YZEC.Icons = {
  cards: '<i class="fa-solid fa-cards"></i>',
  color: '<i class="fa-solid fa-palette"></i>',
  bestCard: '<i class="fa-solid fa-star"></i>',
  duplicate: '<i class="fa-solid fa-clone"></i>',
  follow:'<i class="fa-solid fa-link"></i>',
  unfollow: '<i class="fa-solid fa-link-slash"></i>',
  leader: '<i class="fa-solid fa-flag-swallowtail"></i>',
  makeLeader: '<i class="fa-solid fa-users"></i>',
  removeLeader: '<i class="fa-solid fa-users-slash"></i>',
  select: '<i class="fa-solid fa-square-dashed"></i>',
  swap: '<i class="fa-solid fa-arrow-up-arrow-down"></i>',
};
