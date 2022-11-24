import { MODULE_ID } from './constants.js';

/**
 * The Year Zero Engine Combat configuration.
 * @constant
 * @enum
 */
export const YZEC = {};

YZEC.CombatTracker = {
  src: `modules/${MODULE_ID}/sidebar/combat-tracker.config.json`,
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
 * <div>{{{@root.config.Icons.buttons.xxx}}}</div>
 */
YZEC.Icons = {
  // tabs: {
  //   bio: '<i class="fas fa-align-left"></i>',
  //   combat: '<i class="fas fa-fist-raised"></i>',
  //   features: '<i class="fas fa-briefcase"></i>',
  //   inventory: '<i class="fas fa-archive"></i>',
  //   mods: '<i class="fas fa-puzzle-piece"></i>',
  //   roll: '<i class="fas fa-dice-six"></i>',
  //   stats: '<i class="fas fa-horse-head"></i>',
  // },
  // boxes: {
  //   empty: '<i class="far fa-square"></i>',
  //   full: '<i class="fas fa-square"></i>',
  //   lost: '<i class="far fa-minus-square"></i>',
  // },
  // dice: {
  //   success: '<i class="fas fa-eye"></i>',
  //   failure: '<i class="fas fa-horse-head"></i>',
  // },
  buttons: {
    // action: '<i class="fas fa-play"></i>',
    // edit: '<i class="fas fa-edit"></i>',
    // delete: '<i class="fas fa-trash"></i>',
    // remove: '<i class="fas fa-times"></i>',
    // plus: '<i class="fas fa-plus"></i>',
    // minus: '<i class="fas fa-minus"></i>',
    // advantage: '<i class="fas fa-plus-circle"></i>',
    // disadvantage: '<i class="fas fa-minus-circle"></i>',
    // equip: '<i class="fas fa-star"></i>',
    // unequip: '<i class="far fa-star"></i>',
    // stash: '<i class="fas fa-shopping-bag"></i>',
    // unmount: '<i class="fas fa-thumbtack"></i>',
    // mount: '<i class="fas fa-wrench"></i>',
    // attack: '<i class="fas fa-crosshairs"></i>',
    // armor: '<i class="fas fa-shield-alt"></i>',
    // boom: '<i class="fas fa-bomb"></i>',
    // reload: '<i class="fas fa-sync-alt"></i>',
    // lethal: '<i class="fas fa-skull"></i>',
    // mental: '<i class="fas fa-brain"></i>',
    // vehicle: '<i class="fas fa-car"></i>',
    // chat: '<i class="far fa-comment-dots"></i>',
    // roll: '<i class="fas fa-dice-d20"></i>',
  },
};
