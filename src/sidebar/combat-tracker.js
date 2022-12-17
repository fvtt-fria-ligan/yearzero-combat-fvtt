import { YZEC } from '@module/config';
import { MODULE_ID, SETTINGS_KEYS } from '@module/constants';
import { combatTrackerOnToggleDefeatedStatus, duplicateCombatant } from '@combat/duplicate-combatant';
import { resetInitiativeDeck } from '@utils/utils';

/** @typedef {import('@combat/combatant').default} YearZeroCombatant */
/** @typedef {import('@combat/combat').default} YearZeroCombat */

export default class YearZeroCombatTracker extends CombatTracker {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: `modules/${MODULE_ID}/templates/sidebar/combat-tracker.hbs`,
    });
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

  /**
   * @param {JQuery.<HTMLElement>} _html
   * @param {ContextMenuEntry[]} contextMenu
   */
  static async appendControlsToContextMenu(_html, contextMenu) {
    // The combat tracker will initialize context menus regardless of there being a combat active
    if (!game.combat) return;

    // Scoped consts
    /** @type {YearZeroCombat} */
    const combat = game.combat;
    /** @type {Collection.<YearZeroCombatant>} EmbeddedCollection */
    const combatants = combat.combatants;

    // Changes existing buttons.
    const rerollIndex = contextMenu.findIndex(m => m.name === 'COMBAT.CombatantReroll');
    if (~rerollIndex) contextMenu[rerollIndex].icon = YZEC.Icons.cards;

    /** @type {ContextMenuEntry[]} */
    const newMenu = [];

    // Set Group Leader
    newMenu.push({
      name: 'YZEC.CombatTracker.MakeGroupLeader',
      icon: YZEC.Icons.groupLeader,
      condition: li => {
        const c = combatants.get(li.data('combatant-id'));
        return !c.isGroupLeader && c.actor.isOwner;
      },
      callback: async li => {
        const c = combatants.get(li.data('combatant-id'));
        return c.update({
          [`flags.${MODULE_ID}`]: {
            isGroupLeader: true,
            '-=groupId': null,
          },
        });
      },
    });

    // Set Group Color
    // TODO https://gitlab.com/peginc/swade/-/blob/master/src/module/hooks/SwadeCoreHooks.ts#L570

    // Remove Group Leader
    newMenu.push({
      name: 'YZEC.CombatTracker.RemoveGroupLeader',
      icon: YZEC.Icons.removeGroupLeader,
      condition: li => {
        const c = combatants.get(li.data('combatant-id'));
        return c.isGroupLeader && c.actor.isOwner;
      },
      callback: async li => {
        const c = combatants.get(li.data('combatant-id'));
        for (const f of c.getFollowers()) await f.unsetGroupId();
        await c.unsetIsGroupLeader();
      },
    });

    // Add Selected Tokens As Followers
    newMenu.push({
      name: 'YZEC.CombatTracker.AddFollowers',
      icon: YZEC.Icons.followers,
    });

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
    const { controls } = await YearZeroCombatTracker.#getConfig();
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
    return contextMenu.splice(0, 0, ...newMenu);
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
    if (property) {
      await combatant.setFlag(MODULE_ID, property, !combatant.getFlag(MODULE_ID, property));
    }
    YearZeroCombatTracker.#callHook(eventData);
  }

  /* ------------------------------------------ */

  /**
   * @param {YearZeroCombatant} combatant
   * @override
   */
  async _onToggleDefeatedStatus(combatant) {
    await combatTrackerOnToggleDefeatedStatus(combatant);

    // Changes the group leader.
    if (combatant.isGroupLeader) {
      const newLeader = await this.viewed.combatants.find(f => f.groupId === combatant.id && !f.isDefeated);
      await newLeader.update({
        [`flags.${MODULE_ID}`]: {
          '-=groupId': null,
          isGroupLeader: true,
        },
      });
      const followers = await this._getFollowers(combatant);
      for (const follower of followers) {
        await follower.setGroupId(newLeader.id);
      }
      await combatant.unsetIsGroupLeader();
    }
    if (combatant.groupId) {
      await combatant.unsetGroupId();
    }
  }

  /* ------------------------------------------ */
  /*  Event Listeners                           */
  /* ------------------------------------------ */

  /**
   * @param {JQuery.<HTMLElement>} html
   * @override
   */
  activateListeners(html) {
    super.activateListeners(html);

    html.find('.combat-control[data-control=resetDeck]').on('click', this._onResetInitiativeDeck);

    // Makes combatants draggable for the GM.
    html.find('#combat-tracker li.combatant').each((i, li) => {
      const id = li.dataset.combatantId;
      const combatant = this.viewed?.combatants.get(id, { strict: true });
      if (combatant?.actor.isOwner || game.user.isGM) {
        // Adds draggable attribute and drag listeners.
        li.setAttribute('draggable', true);
        li.classList.add('draggable');
        // On dragStart:
        li.addEventListener('dragstart', this._onDragStart, false);
        // On dragOver:
        li.addEventListener('dragover', ev =>
          $(ev.target).closest('li.combatant').addClass('dropTarget'),
        );
        // On dragLeave:
        li.addEventListener('dragLeave', ev =>
          $(ev.target).closest('li.combatant').removeClass('dropTarget'),
        );
      }
    });
  }
  /* ------------------------------------------ */

  _onResetInitiativeDeck(event) {
    event.preventDefault();
    return resetInitiativeDeck();
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

  /* ------------------------------------------ */

  /**
   * Sets the turn's properties for the template.
   * @param {*} data
   * @param {*} turn
   * @returns {Promise.<any>}
   */
  #setTurnProperties(data, turn) {
    const { id } = turn;
    const combatant = data.combat.combatants.get(id);
    return {
      ...combatant.flags[MODULE_ID],
      emptyInit: !!combatant.groupId || turn.defeated,
    };
  }
}
