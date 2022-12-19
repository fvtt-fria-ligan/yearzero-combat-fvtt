import { YZEC } from '@module/config';
import { MODULE_ID } from '@module/constants';

export default class YearZeroCombatGroupColor extends FormApplication {
  /**
   * @param {import('@combat/combatant').default} object
   * @param {Object} [options]
   */
  constructor(object, options = {}) {
    super(object, options);
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'group-color-picker',
      title: 'YZEC.CombatTracker.SetGroupColor',
      template: `modules/${MODULE_ID}/templates/sidebar/combatant-group-color-picker.hbs`,
      classes: ['dialog', game.system.id, MODULE_ID],
      width: 275,
      height: 'auto',
      resizable: false,
      closeOnSubmit: true,
      submitOnClose: true,
      submitOnChange: false,
    });
  }

  /**
   * @type {import('@combat/combatant').default}
   * @readonly
   */
  get combatant() {
    return this.object;
  }

  /** @override */
  async getData() {
    const data = await super.getData();
    data.groupColor = this.getGroupColor();
    return data;
  }

  /**
   * @param {JQuery.<HTMLElement>} html
   * @override
   */
  activateListeners(html) {
    super.activateListeners(html);
    html.find('.reset-color').on('click', this._onResetColor.bind(this));
  }

  /** @override */
  async _onChangeColorPicker(event) {
    super._onChangeColorPicker(event);
    return this.combatant.setFlag(MODULE_ID, 'groupColor', event.currentTarget.value);
  }

  /** @private */
  async _onResetColor() {
    const c = game.combat.combatants.get(this.combatant.id);
    let color = YZEC.defaultGroupColor;

    if (c.players.length) color = c.players[0].color;
    else {
      const gm = game.users?.find(u => u.isGM);
      if (gm) color = gm.color;
    }

    await this.combatant.unsetFlag(MODULE_ID, 'groupColor');
    $(this.form).find('#groupColor').val(color);
  }

  /**
   * @param {*} _event
   * @param {GroupColorPickerData} _formData
   */
  // eslint-disable-next-line no-empty-function
  async _updateObject(_event, _formData) {}

  getGroupColor() {
    const c = game.combat.combatants.get(this.combatant.id);
    const color = c.getFlag(MODULE_ID, 'groupColor');
    if (color) return color;
    if (c.players.length) return c.players[0].color;
    return game.users.find(u => u.isGM)?.color ?? YZEC.defaultGroupColor;
  }
}
