import { CARDS_DRAW_KEEP_STATES, MODULE_ID, STATUS_EFFECTS } from './constants.js';

/**
 * The Year Zero Engine Combat configuration.
 * @constant
 * @enum
 */
export const YZEC = {};

function singleActionCondition(combat, combatant, index) {
  const tokenId = combat.combatants.get(combatant.id).tokenId;
  let action = 0;
  for (const turn of combat.turns) {
    if (turn.tokenId === tokenId) action++;
    if (turn.id === combatant.id) break;
  }
  return action === index;
}

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
        eventName: 'single-action-button-1-clicked',
        icon: 'fa-play',
        id: 'single-action-button-1',
        property: 'action1',
        label: 'YZEC.CombatTracker.SingleAction',
        visibility: 'owner',
        condition: (combat, combatant) => singleActionCondition(combat, combatant, 1),
      },
      {
        eventName: 'single-action-button-2-clicked',
        icon: 'fa-play',
        id: 'single-action-button-2',
        property: 'action2',
        label: 'YZEC.CombatTracker.SingleAction',
        visibility: 'owner',
        condition: (combat, combatant) => singleActionCondition(combat, combatant, 2),
      },
      {
        eventName: 'single-action-button-3-clicked',
        icon: 'fa-play',
        id: 'single-action-button-3',
        property: 'action3',
        label: 'YZEC.CombatTracker.SingleAction',
        visibility: 'owner',
        condition: (combat, combatant) => singleActionCondition(combat, combatant, 3),
      },
      {
        eventName: 'single-action-button-4-clicked',
        icon: 'fa-play',
        id: 'single-action-button-4',
        property: 'action4',
        label: 'YZEC.CombatTracker.SingleAction',
        visibility: 'owner',
        condition: (combat, combatant) => singleActionCondition(combat, combatant, 4),
      },
      {
        eventName: 'single-action-button-5-clicked',
        icon: 'fa-play',
        id: 'single-action-button-5',
        property: 'action5',
        label: 'YZEC.CombatTracker.SingleAction',
        visibility: 'owner',
        condition: (combat, combatant) => singleActionCondition(combat, combatant, 5),
      },
      {
        eventName: 'single-action-button-6-clicked',
        icon: 'fa-play',
        id: 'single-action-button-6',
        property: 'action6',
        label: 'YZEC.CombatTracker.SingleAction',
        visibility: 'owner',
        condition: (combat, combatant) => singleActionCondition(combat, combatant, 6),
      },
      {
        eventName: 'single-action-button-7-clicked',
        icon: 'fa-play',
        id: 'single-action-button-7',
        property: 'action7',
        label: 'YZEC.CombatTracker.SingleAction',
        visibility: 'owner',
        condition: (combat, combatant) => singleActionCondition(combat, combatant, 7),
      },
      {
        eventName: 'single-action-button-8-clicked',
        icon: 'fa-play',
        id: 'single-action-button-8',
        property: 'action8',
        label: 'YZEC.CombatTracker.SingleAction',
        visibility: 'owner',
        condition: (combat, combatant) => singleActionCondition(combat, combatant, 8),
      },
      {
        eventName: 'single-action-button-9-clicked',
        icon: 'fa-play',
        id: 'single-action-button-9',
        property: 'action9',
        label: 'YZEC.CombatTracker.SingleAction',
        visibility: 'owner',
        condition: (combat, combatant) => singleActionCondition(combat, combatant, 9),
      },
    ],
    lockInitiative: [
      {
        eventName: 'lock-initiative-button-clicked',
        label: 'YZEC.CombatTracker.LockInitiative',
        icon: 'fas fa-lock',
        id: 'lock-initiative-button',
        property: 'lockInitiative',
        visibility: 'owner',
        condition: (combat, combatant) => {
          const combatHasBegun = combat.active && combat.started;
          const notInGroup = !combatant.groupId;
          const hasCard = combatant.cardValue !== null;
          return combatHasBegun && notInGroup && hasCard;
        },
      },
    ],
    ambushed: [
      {
        eventName: 'ambushed-button-clicked',
        label: 'YZEC.CombatTracker.Ambushed',
        icon: 'fas fa-face-surprise',
        id: 'ambushed-button',
        property: 'ambushed',
        visibility: 'owner',
        condition: (_combat, combatant) => {
          const notInGroup = !combatant.groupId;
          return notInGroup;
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
      name: 'YZEC.CombatTracker.FastAction',
      img: `modules/${MODULE_ID}/assets/icons/fast-action.svg`,
      statuses: ['fastAction'],
    },
    {
      id: STATUS_EFFECTS.SLOW_ACTION,
      name: 'YZEC.CombatTracker.SlowAction',
      img: `modules/${MODULE_ID}/assets/icons/slow-action.svg`,
      statuses: ['slowAction'],
    },
  ],
  singleAction: [
    {
      id: STATUS_EFFECTS.SINGLE_ACTION_1,
      name: 'YZEC.CombatTracker.SingleAction',
      img: `modules/${MODULE_ID}/assets/icons/slow-action.svg`,
      statuses: ['action1'],
    },
    {
      id: STATUS_EFFECTS.SINGLE_ACTION_2,
      name: 'YZEC.CombatTracker.SingleAction',
      img: `modules/${MODULE_ID}/assets/icons/slow-action.svg`,
      statuses: ['action2'],
    },
    {
      id: STATUS_EFFECTS.SINGLE_ACTION_3,
      name: 'YZEC.CombatTracker.SingleAction',
      img: `modules/${MODULE_ID}/assets/icons/slow-action.svg`,
      statuses: ['action3'],
    },
    {
      id: STATUS_EFFECTS.SINGLE_ACTION_4,
      name: 'YZEC.CombatTracker.SingleAction',
      img: `modules/${MODULE_ID}/assets/icons/slow-action.svg`,
      statuses: ['action4'],
    },
    {
      id: STATUS_EFFECTS.SINGLE_ACTION_5,
      name: 'YZEC.CombatTracker.SingleAction',
      img: `modules/${MODULE_ID}/assets/icons/slow-action.svg`,
      statuses: ['action5'],
    },
    {
      id: STATUS_EFFECTS.SINGLE_ACTION_6,
      name: 'YZEC.CombatTracker.SingleAction',
      img: `modules/${MODULE_ID}/assets/icons/slow-action.svg`,
      statuses: ['action6'],
    },
    {
      id: STATUS_EFFECTS.SINGLE_ACTION_7,
      name: 'YZEC.CombatTracker.SingleAction',
      img: `modules/${MODULE_ID}/assets/icons/slow-action.svg`,
      statuses: ['action7'],
    },
    {
      id: STATUS_EFFECTS.SINGLE_ACTION_8,
      name: 'YZEC.CombatTracker.SingleAction',
      img: `modules/${MODULE_ID}/assets/icons/slow-action.svg`,
      statuses: ['action8'],
    },
    {
      id: STATUS_EFFECTS.SINGLE_ACTION_9,
      name: 'YZEC.CombatTracker.SingleAction',
      img: `modules/${MODULE_ID}/assets/icons/slow-action.svg`,
      statuses: ['action9'],
    },
  ],
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
