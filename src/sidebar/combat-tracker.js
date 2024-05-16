/* ------------------------------------------ */
/*  COMBAT TRACKER                            */
/* ------------------------------------------ */
/*  Notes:                                    */
/*   Some code parts are greatly inspired     */
/*   by FloRad's work on the SWADE system     */
/*   https://gitlab.com/peginc/swade          */
/* ------------------------------------------ */

import {
  combatTrackerOnToggleDefeatedStatus,
  duplicateCombatant, getCombatantsSharingToken,
} from '@combat/duplicate-combatant';
import { YZEC } from '@module/config';
import { MODULE_ID, SETTINGS_KEYS } from '@module/constants';
import { getCombatantSortOrderModifier, resetInitiativeDeck } from '@utils/utils';
import YearZeroCombatGroupColor from '../apps/combat-group-color';

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
      ...YearZeroCombatTracker.#setTurnProperties(data, turn),
    }));
    const buttons = await this.#getButtonConfig();
    return {
      ...data,
      turns,
      buttons,
      config: YZEC,
    };
  }

  /* ------------------------------------------ */

  /**
   * Appends extra controls to the combatant's context menu.
   * Inspired by FloRad's method in the {@link https://gitlab.com/peginc/swade FloRad (SWADE system)}
   * (for group leaders & followers)
   * @param {JQuery.<HTMLElement>} _html
   * @param {ContextMenuEntry[]} contextMenu
   */
  static async appendControlsToContextMenu(_html, contextMenu) {
    // The combat tracker will initialize context menus regardless of there being a combat active
    if (!game.combat) return;

    // Scoped Constants
    /** @type {YearZeroCombat} */
    const combat = game.combat;
    /** @type {Collection.<YearZeroCombatant>} EmbeddedCollection */
    const combatants = combat.combatants;

    /** @returns {YearZeroCombatant} */
    const getCombatant = li => combatants.get(li.data('combatant-id'));

    // Changes existing buttons.
    const rerollIndex = contextMenu.findIndex(m => m.name === 'COMBAT.CombatantReroll');
    if (~rerollIndex) contextMenu[rerollIndex].icon = YZEC.Icons.cards;

    /** @type {ContextMenuEntry[]} */
    const newMenu = [];

    // 👑 Set Group Leader
    newMenu.push({
      name: 'YZEC.CombatTracker.MakeGroupLeader',
      icon: YZEC.Icons.makeLeader,
      condition: li => {
        const c = getCombatant(li);
        return !c.isGroupLeader && c.actor?.isOwner;
      },
      callback: async li => getCombatant(li).promoteLeader(),
    });

    // 🎨 Set Group Color
    newMenu.push({
      name: 'YZEC.CombatTracker.SetGroupColor',
      icon: YZEC.Icons.color,
      condition: li => {
        const c = getCombatant(li);
        return c.isGroupLeader && c.actor?.isOwner;
      },
      callback: li => new YearZeroCombatGroupColor(getCombatant(li)).render(true),
    });

    // 🚫 Remove Group Leader
    newMenu.push({
      name: 'YZEC.CombatTracker.RemoveGroupLeader',
      icon: YZEC.Icons.removeLeader,
      condition: li => {
        const c = getCombatant(li);
        return c.isGroupLeader && c.actor?.isOwner;
      },
      callback: async li => getCombatant(li).unpromoteLeader(),
    });

    // 👥 Add Selected Tokens As Followers
    newMenu.push({
      name: 'YZEC.CombatTracker.AddFollowers',
      icon: YZEC.Icons.select,
      condition: () => {
        const selectedTokens = canvas?.tokens?.controlled || [];
        return canvas?.ready &&
          selectedTokens.length > 0 &&
          selectedTokens.every(t => t.actor?.isOwner);
      },
      callback: async li => {
        const combatant = getCombatant(li);
        const selectedTokens = canvas?.tokens?.controlled;
        if (selectedTokens) {
          await combatant.promoteLeader();

          // Separates between new tokens and existing ones.
          const [newCombatantTokens, existingCombatantTokens] = selectedTokens.partition(t => t.inCombat);

          // For new tokens, creates new combatants.
          const createData = newCombatantTokens.map(t => ({
            tokenId: t.id,
            actorId: t.actorId,
            hidden: t.hidden,
          }));

          const cmbts = await combat.createEmbeddedDocuments('Combatant', createData);

          // For existing combatants, just add them.
          if (existingCombatantTokens.length > 0) {
            for (const t of existingCombatantTokens) {
              const c = combat.getCombatantByToken(t.id);
              if (c) cmbts.push(c);
            }
          }

          // Then sets all those combatants as followers.
          if (cmbts) {
            for (const c of cmbts) await combatant.addFollower(c);
          }
          for (const f of combatant.getFollowers()) {
            await f.update({
              initiative: combatant.initiative,
              [`flags.${MODULE_ID}.cardValue`]: combatant.cardValue + getCombatantSortOrderModifier(),
              [`flags.${MODULE_ID}.cardName`]: combatant.cardName,
            });
          }
        }
      },
    });

    // Gets group leaders to prepare follow options.
    const leaders = combat.combatants.filter(c => c.isGroupLeader);
    for (const leader of leaders) {
      // ➰ Follow a Leader
      newMenu.push({
        name: game.i18n.format('YZEC.CombatTracker.FollowLeader', { name: leader.name }),
        icon: YZEC.Icons.follow,
        condition: li => {
          const c = getCombatant(li);
          return c.groupId !== leader.id && c.id !== leader.id;
        },
        callback: async li => {
          const c = getCombatant(li);
          // If that combatant is a leader too, move all its followers under the new leader
          if (c.isGroupLeader) {
            for (const f of c.getFollowers()) {
              await leader.addFollower(f);
            }
          }
          await leader.addFollower(c);
        },
      });

      // ❌ Unfollow a Leader
      newMenu.push({
        name: game.i18n.format('YZEC.CombatTracker.UnfollowLeader', { name: leader.name }),
        icon: YZEC.Icons.unfollow,
        condition: li => getCombatant(li).groupId === leader.id,
        callback: async li => {
          const c = getCombatant(li);
          return c.update({
            [`flags.${MODULE_ID}.cardValue`]: leader.cardValue,
            [`flags.${MODULE_ID}.-=groupId`]: null,
          });
        },
      });
    }

    // This is the base index at which the controls will be inserted.
    // The preceding controls will (in a vanilla scenario) be the "Attack" and "End Turn" buttons.
    let index = 3;

    // Adds "Swap Initiative" context menu entry.
    contextMenu.splice(index, -1, {
      name: 'YZEC.CombatTracker.SwapInitiative',
      icon: YZEC.Icons.swap,
      condition: li => {
        const combatant = getCombatant(li);
        if (combatant.groupId) return false;
        return game.user.isGM &&
          combatants.filter(c => c.initiative && !c.groupId).length > 1;
      },
      callback: async li => {
        const combatant = getCombatant(li);
        const template = `modules/${MODULE_ID}/templates/combat/choose-combatant-dialog.hbs`;
        const content = await renderTemplate(template, {
          combatants: combatants.filter(c => c.initiative && !c.groupId && c.id !== combatant.id),
        });
        const targetId = await Dialog.prompt({
          title: game.i18n.localize('YZEC.CombatTracker.SwapInitiative'),
          content,
          callback: html => html.find('#initiative-swap')[0]?.value,
          options: { classes: ['dialog', game.system.id, MODULE_ID] },
        });
        const target = combat.combatants.get(targetId);
        if (target) combatant.swapInitiativeCard(target);
      },
    });
    index++;

    // Adds "Duplicate Combatant" context menu entry.
    contextMenu.splice(index, -1, {
      name: 'YZEC.CombatTracker.DuplicateCombatant',
      icon: YZEC.Icons.duplicate,
      condition: game.user.isGM,
      callback: li => {
        const c = getCombatant(li);
        return duplicateCombatant(c);
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
    await super._onCombatantControl(event);
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
    if (property === 'slowAction' || property === 'fastAction' || property === 'action') {
      const effect = CONFIG.statusEffects.find(e => e.id === property);
      const active = !combatant[property];
      if (!active) await combatant.unsetFlag(MODULE_ID, property);
      await combatant.token.toggleActiveEffect(
        { ...effect },
        { active },
      );
    }
    else if (property) {
      await combatant.setFlag(MODULE_ID, property, !combatant.getFlag(MODULE_ID, property));
    }

    { YearZeroCombatTracker.#callHook(eventData); }
  }

  /* ------------------------------------------ */

  /**
   * @param {YearZeroCombatant} combatant
   * @override
   */
  async _onToggleDefeatedStatus(combatant) {
    await combatTrackerOnToggleDefeatedStatus(combatant);

    // Finds a new group leader.
    if (combatant.isGroupLeader) {
      const newLeader = await this.viewed.combatants.find(f => f.groupId === combatant.id && !f.isDefeated);
      if (!newLeader) return;

      await newLeader.promoteLeader();

      for (const follower of combatant.getFollowers()) {
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
   * @author FloRad (SWADE system)
   * @override
   */
  activateListeners(html) {
    super.activateListeners(html);

    html.find('.combat-control[data-control=resetDeck]').on('click', this._onResetInitiativeDeck);

    // Makes combatants draggable for the GM.
    html.find('#combat-tracker li.combatant').each((_i, li) => {
      const id = li.dataset.combatantId;
      const combatant = this.viewed?.combatants.get(id, { strict: true });
      if (combatant?.actor?.isOwner || game.user.isGM) {
        // Adds draggable attribute and drag listeners.
        li.setAttribute('draggable', true);
        li.classList.add('draggable');
        // On dragStart:
        li.addEventListener('dragstart', this._onDragStart, false);
        // On dragOver:
        li.addEventListener('dragover', ev =>
          $(ev.target).closest('li.combatant').addClass('drop-target'),
        );
        // On dragLeave:
        li.addEventListener('dragleave', ev =>
          $(ev.target).closest('li.combatant').removeClass('drop-target'),
        );
        // On dragDrop:
        li.addEventListener('drop', this._onDrop.bind(this), false);
      }
    });
  }

  /* ------------------------------------------ */

  /**
   * @param {DragEvent} event
   * @override
   */
  _onDragStart(event) {
    const id = $(event.target).closest('li.combatant').data('combatant-id');
    event.dataTransfer.setData('text', id);
  }
  /* ------------------------------------------ */

  /**
   * @param {DragEvent} event
   * @author FloRad (SWADE system)
   * @override
   */
  async _onDrop(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const li = $(event.target).closest('li.combatant');
    li.removeClass('drop-target');

    const leaderId = li.data('combatant-id');
    const draggedCombatantId = event.dataTransfer.getData('text');
    if (leaderId === draggedCombatantId) return;

    /** @type {YearZeroCombatant} */
    const leader = this.viewed?.combatants.get(leaderId);
    if (!leader.canUserModify(game.user, 'update')) return;

    await leader.promoteLeader();

    /** @type {YearZeroCombatant} */
    const draggedCombatant = this.viewed?.combatants.get(draggedCombatantId);

    if (draggedCombatant.isGroupLeader) {
      for (const f of draggedCombatant.getFollowers()) {
        await leader.addFollower(f);
      }
    }
    await leader.addFollower(draggedCombatant);
  }

  /* ------------------------------------------ */

  async _onResetInitiativeDeck(event) {
    event.preventDefault();
    return resetInitiativeDeck(true);
  }

  /* ------------------------------------------ */

  /** @override */
  hoverCombatant(combatant, hover) {
    const trackers = [this.element[0]];
    if (this._popout) trackers.push(this._popout.element[0]);
    for (const tracker of trackers) {
      for (const c of getCombatantsSharingToken(combatant)) {
        const li = tracker.querySelector(`.combatant[data-combatant-id="${c.id}"]`);
        if (!li) continue;
        if (hover) li.classList.add('hover');
        else li.classList.remove('hover');
      }
    }
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
        else if (game.settings.get(MODULE_ID, SETTINGS_KEYS.SINGLE_ACTION)) {
          cfg.buttons.unshift(...YZEC.CombatTracker.DefaultCombatantControls.singleAction);
        }

        if (game.settings.get(MODULE_ID, SETTINGS_KEYS.RESET_EACH_ROUND)) {
          cfg.buttons.unshift(...YZEC.CombatTracker.DefaultCombatantControls.lockInitiative);
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

  /**
   * Sets the turn's properties for the template.
   * @param {*} data
   * @param {*} turn
   * @returns {Promise.<any>}
   */
  static #setTurnProperties(data, turn) {
    const { id } = turn;
    const combatant = data.combat.combatants.get(id);
    const flags = combatant.flags[MODULE_ID];
    // FIXME: Figure out why these turn up as flags.
    delete flags.fastAction;
    delete flags.slowAction;
    delete flags.action;
    const statuses = combatant.actor?.statuses.reduce((acc, s) => {
      acc[s] = true;
      return acc;
    }, flags) || flags;
    return {
      ...statuses,
      emptyInit: !!combatant.groupId || turn.defeated,
      groupColor: YearZeroCombatTracker.#getGroupColor(combatant),
    };
  }

  /* ------------------------------------------ */

  static #getGroupColor(combatant) {
    if (combatant.groupId) {
      return combatant.getLeader()?.getColor();
    }
    if (combatant.isDefeated) {
      return YZEC.defeatedGroupColor;
    }
    return combatant.getColor();
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

        // Create getters for the button properties.
        if (!CONFIG.Combatant.documentClass.prototype.hasOwnProperty(buttonConfig.property)) {
          Object.defineProperty(CONFIG.Combatant.documentClass.prototype, buttonConfig.property, {
            get() {
              return this.getFlag(MODULE_ID, buttonConfig.property);
            },
          });
        }

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
}
