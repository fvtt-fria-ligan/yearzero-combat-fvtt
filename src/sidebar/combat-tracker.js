import { MODULE_NAME } from '@module/constants';

export default class YearZeroCombatTracker extends CombatTracker {
  // TODO https://gitlab.com/peginc/swade/-/blob/develop/src/module/sidebar/SwadeCombatTracker.ts

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: `modules/${MODULE_NAME}/templates/sidebar/combat-tracker.hbs`,
    });
  }

  static async appendControlsToContextMenu(_, contextMenu) {
    const { controls } = await YearZeroCombatTracker.#getConfig();
    let index = 3;

    controls.forEach(({ eventName, icon, label }) => {
      const combat = game.combat;
      const combatants = combat.combatants;

      contextMenu.splice(index, -1, {
        icon: `<i class="fas ${icon}"></i>`,
        name: game.i18n.localize(label),
        callback: li =>
          YearZeroCombatTracker.#callHook({
            combat,
            combatant: combatants.get(li.data('combatant-id')),
            event: eventName,
          }),
      });

      index += 1;
    });
    return contextMenu;
  }

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
    YearZeroCombatTracker.#callHook(eventData);
    combatant.setFlag('yze-combat', property, !combatant.getFlag('yze-combat', property));
  }

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

  /* @private static methods */

  // Gets the config object by fetching a JSON file defined in the CONFIG object.
  static async #getConfig() {
    const { config } = CONFIG.YZE_COMBAT.CombatTracker;
    if (config && typeof config === 'object') return config;
    else {
      try {
        const { src } = CONFIG.YZE_COMBAT.CombatTracker;
        CONFIG.YZE_COMBAT.CombatTracker.config = await foundry.utils.fetchJsonWithTimeout(src);
        return CONFIG.YZE_COMBAT.CombatTracker.config;
      }
      catch (error) {
        console.error(error);
        throw new Error(`${MODULE_NAME}: Failed to get combat tracker config`);
      }
    }
  }

  // Calls the CombatTracker hook with the given event data.
  static #callHook(data) {
    data.emit = options =>
      game.socket.emit(`module.${MODULE_NAME}`, {
        data,
        options,
      });
    Hooks.call(`${MODULE_NAME}.${data.event}`, data);
  }

  /* @private methods */

  // Gets the combat tracker buttons transformed for the template.
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

  // Sets the turn's properties for the template.
  #setTurnProperties(data, turn) {
    const { id } = turn;
    const combatant = data.combat.combatants.get(id);
    return combatant.data.flags['yze-combat'] ?? {};
  }
}
