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
    const c = combat.combatants.get(li.dataset.combatantId);
    switch (btn.dataset.control) {
      case 'toggleFast':
        return c.setFlag('yze-combat', 'fast', !c.fast);
      case 'toggleSlow':
        return c.setFlag('yze-combat', 'slow', !c.slow);
    }
  }

  /** @override */
  async getData(options) {
    const data = await super.getData(options);
    return {
      ...data,
      turns: data.turns.map(turn => {
        const c = this.viewed.combatants.get(turn.id);
        turn.fast = c.fast;
        turn.slow = c.slow;
        return turn;
      }),
    };
  }
}
