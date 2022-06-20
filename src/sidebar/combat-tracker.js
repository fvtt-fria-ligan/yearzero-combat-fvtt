import { MODULE_NAME } from '@system/constants';

export default class YearZeroCombatTracker extends CombatTracker {
  // TODO https://gitlab.com/peginc/swade/-/blob/develop/src/module/sidebar/SwadeCombatTracker.ts

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: `modules/${MODULE_NAME}/templates/sidebar/combat-tracker.hbs`,
    });
  }

  /* ------------------------------------------ */

  /** @override */
  getData() {
    const data = super.getData();
    // TODO transform data
    return data;
  }

  /* ------------------------------------------ */

  /**
   * @param {JQuery.<HTMLElement>} html
   * @override
   */
  activateListeners(html) {
    super.activateListeners(html);
  }
}