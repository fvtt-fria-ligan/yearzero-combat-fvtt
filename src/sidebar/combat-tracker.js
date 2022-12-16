import { YZEC } from '@module/config';
import { MODULE_ID, SETTINGS_KEYS } from '@module/constants';
import { duplicateCombatant } from '@combat/duplicate-combatant';

export default class YearZeroCombatTracker extends CombatTracker {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: `modules/${MODULE_ID}/templates/sidebar/combat-tracker.hbs`,
    });
  }

  /* ------------------------------------------ */

  static async appendControlsToContextMenu(_, contextMenu) {
    // The combat tracker will initialize context menus regardless of there being a combat active
    if (!game.combat) return;

    // Scoped consts
    const combat = game.combat;
    const combatants = combat.combatants;
    const { controls } = await YearZeroCombatTracker.#getConfig();

    // This is the base index at which the controls will be inserted.
    // The preceding controls will (in a vanilla scenario) be the "Attack" and "End Turn" buttons.
    let index = 3;

    // Adds "Duplicate Combatant" context menu entry.
    contextMenu.splice(index, -1, {
      icon: YZEC.Icons.duplicate,
      name: game.i18n.localize('YZEC.CombatTracker.DuplicateCombatant'),
      condition: game.user.isGM,
      callback: li => {
        const combatant = combatants.get(li.data('combatant-id'));
        return duplicateCombatant(combatant);
      },
    });
    index++;

    // Adds other context menu entries from the configuration.
    for (const { eventName, icon, label, visibility } of controls) {
      const condition = visibility === 'gm' ? game.user.isGM : true;

      contextMenu.splice(index, -1, {
        icon: `<i class="fas ${icon}"></i>`,
        name: game.i18n.localize(label),
        condition,
        callback: li =>
          YearZeroCombatTracker.#callHook({
            combat,
            combatant: combatants.get(li.data('combatant-id')),
            event: eventName,
          }),
      });
      index++;
    };
    return contextMenu;
  }

  /* ------------------------------------------ */

  /** @override */
  async _onCombatantControl(event) {
    super._onCombatantControl(event);
    const btn = event.currentTarget;
    const li = btn.closest('.combatant');
    const combat = this.viewed;
    const combatant = combat.combatants.get(li.dataset.combatantId);
    const eventName = btn.dataset.event;
    const property = btn.dataset.property;
    const eventData = {
      combat,
      combatant,
      property,
      event: eventName,
      origin: btn,
    };
    await combatant.setFlag(MODULE_ID, property, !combatant.getFlag(MODULE_ID, property));
    YearZeroCombatTracker.#callHook(eventData);
  }

  /* ------------------------------------------ */

  /** @override */
  async getData(options) {
    const data = await super.getData(options);
    const turns = data.turns.map(turn => ({
      ...turn,
      ...this.#setTurnProperties(data, turn),
    }));
    const buttons = await this.#getButtonConfig();
    return {
      ...data,
      turns,
      buttons,
    };
  }

  /* ------------------------------------------ */
  /*  Private Static Methods                    */
  /* ------------------------------------------ */

  /**
   * Gets the config object by fetching a JSON file defined in the CONFIG object.
   */
  static async #getConfig() {
    const { config } = CONFIG.YZE_COMBAT.CombatTracker;
    if (typeof config === 'object') return config;
    else {
      try {
        const { src } = CONFIG.YZE_COMBAT.CombatTracker;
        const cfg = await foundry.utils.fetchJsonWithTimeout(src);

        if (!cfg.buttons) cfg.buttons = [];
        if (!cfg.controls) cfg.controls = [];

        if (game.settings.get(MODULE_ID, SETTINGS_KEYS.SLOW_AND_FAST_ACTIONS)) {
          cfg.buttons.unshift(...YZEC.CombatTracker.DefaultCombatantControls.slowAndFastActions);
        }

        CONFIG.YZE_COMBAT.CombatTracker.config = cfg;
        return cfg;
      }
      catch (error) {
        console.error(error);
        throw new Error(`${MODULE_ID}: Failed to get combat tracker config`);
      }
    }
  }

  /* ------------------------------------------ */

  // Calls the CombatTracker hook with the given event data.
  static #callHook(data) {
    data.emit = options =>
      game.socket.emit(`module.${MODULE_ID}`, {
        data,
        options,
      });
    Hooks.call(`${MODULE_ID}.${data.event}`, data);
  }

  /* ------------------------------------------ */
  /*  Private Methods                           */
  /* ------------------------------------------ */

  /**
   * Gets the combat tracker buttons transformed for the template.
   * @returns {Promise.<Object[]>}
   */
  async #getButtonConfig() {
    const { buttons } = await YearZeroCombatTracker.#getConfig();

    const sortedButtons = buttons.reduce(
      (acc, button) => {
        const { visibility, ...buttonConfig } = button;
        if (visibility === 'gm') {
          acc.gmButtons.push(buttonConfig);
        }
        else if (visibility === 'owner') {
          acc.ownerButtons.push(buttonConfig);
        }
        else {
          acc.commonButtons.push(buttonConfig);
        }
        return acc;
      },
      {
        commonButtons: [],
        gmButtons: [],
        ownerButtons: [],
      },
    );
    return sortedButtons;
  }

  /**
   * Sets the turn's properties for the template.
   * @param {*} data
   * @param {*} turn
   * @returns {Promise.<any>}
   */
  #setTurnProperties(data, turn) {
    const { id } = turn;
    const combatant = data.combat.combatants.get(id);
    return combatant.flags[MODULE_ID] ?? {};
  }
}
