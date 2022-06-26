import { MODULE_NAME } from '@module/constants';

export default class YearZeroCombatTracker extends CombatTracker {
  // TODO https://gitlab.com/peginc/swade/-/blob/develop/src/module/sidebar/SwadeCombatTracker.ts

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: `modules/${MODULE_NAME}/templates/sidebar/combat-tracker.hbs`,
    });
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
    eventData.emit = options =>
      game.socket.emit(`module.${MODULE_NAME}`, {
        data: eventData,
        options,
      });
    Hooks.call(`${MODULE_NAME}.${eventName}`, eventData);
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

  /** @private */
  async #getButtonConfig() {
    const { src } = CONFIG.YZE_COMBAT.CombatTracker.config;
    const { buttons } = await foundry.utils.fetchJsonWithTimeout(src);
    const sortedButtons = buttons.reduce((acc, button) => {
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
    }, {
      commonButtons: [],
      gmButtons: [],
      ownerButtons: [],
    });
    return sortedButtons;
  }

  #setTurnProperties(data, turn) {
    const { id } = turn;
    const combatant = data.combat.combatants.get(id);
    return combatant.data.flags['yze-combat'] ?? {};
  }
}
