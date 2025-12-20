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
import { MODULE_ID, SETTINGS_KEYS, STATUS_EFFECTS } from '@module/constants';
import { getCombatantSortOrderModifier, resetInitiativeDeck } from '@utils/utils';
import YearZeroCombatGroupColor from '../apps/combat-group-color';

/** @typedef {import('@combat/combatant').default} YearZeroCombatant */
/** @typedef {import('@combat/combat').default} YearZeroCombat */

export default class YearZeroCombatTracker extends foundry.applications.sidebar.tabs.CombatTracker {

  static DEFAULT_OPTIONS = {
    actions: {
      fastAction: YearZeroCombatTracker.#onCombatantControl,
      slowAction: YearZeroCombatTracker.#onCombatantControl,
      action1: YearZeroCombatTracker.#onCombatantControl,
      action2: YearZeroCombatTracker.#onCombatantControl,
      action3: YearZeroCombatTracker.#onCombatantControl,
      action4: YearZeroCombatTracker.#onCombatantControl,
      action5: YearZeroCombatTracker.#onCombatantControl,
      action6: YearZeroCombatTracker.#onCombatantControl,
      action7: YearZeroCombatTracker.#onCombatantControl,
      action8: YearZeroCombatTracker.#onCombatantControl,
      action9: YearZeroCombatTracker.#onCombatantControl,
      lockInitiative: YearZeroCombatTracker.#onCombatantControl,
      ambushed: YearZeroCombatTracker.#onCombatantControl,
    } };

  /** @override */
  static PARTS = {
    header: {
      template: 'templates/sidebar/tabs/combat/header.hbs',
    },
    tracker: {
      template: `modules/${MODULE_ID}/templates/sidebar/tracker.hbs`,
    },
    footer: {
      template: 'templates/sidebar/tabs/combat/footer.hbs',
    },
  };

  /* ------------------------------------------ */

  /** @override */
  async _preparePartContext(partId, context, options) {
    const data = await super._preparePartContext(partId, context, options);
    return {
      ...data,
      config: YZEC,
    };

  }

  /** @override */
  async _prepareTurnContext(combat, combatant, index) {
    const buttons = await this.#getButtonConfig();
    const turn = await super._prepareTurnContext(combat, combatant, index);
    return {
      buttons,
      combatant,
      ...turn,
      ...YearZeroCombatTracker.#setTurnProperties(combatant, turn),
    };
  }

  /** @override */
  async _onRender(context, options) {
    // Check if group leader status has changed to 'dead', if so, remove from group and find new leader.
    // This is needed in case the defeated status is changed outside of the combat tracker.
    for (const combatant of this.viewed.combatants) {
      if (combatant.isGroupLeader && combatant.isDefeated) {
        await this.#removeFromGroup(combatant);
      }
    }
    await super._onRender(context, options);
  }

  /** @override */
  _formatEffectsTooltip(effects) {
    if (!effects.length) return '';
    const ul = document.createElement('ul');
    ul.classList.add('effects-tooltip', 'plain');
    for (const effect of effects) {
      if (!effect.img?.startsWith('modules/yze-combat')) {
        const img = document.createElement('img');
        img.src = effect.img;
        img.alt = effect.name;
        const span = document.createElement('span');
        span.textContent = effect.name;
        const li = document.createElement('li');
        li.append(img, span);
        ul.append(li);
      }
    }
    return ul.outerHTML;
  }

  /* ------------------------------------------ */

  // Get context menu entries for Combat in the tracker.
  /** @override */
  _getCombatContextOptions() {
    return [{
      name: 'YZEC.CombatTracker.InitiativeDeckReset',
      icon: YZEC.Icons.cards,
      condition: () => game.user.isGM && (this.viewed?.turns.length > 0),
      callback: () => resetInitiativeDeck(true),
    }].concat(super._getCombatContextOptions());
  }

  /* ------------------------------------------ */

  _getEntryContextOptions() {
    const contextMenu = super._getEntryContextOptions();

    /** @returns {YearZeroCombatant} */
    const getCombatant = li => this.viewed.combatants.get(li.dataset.combatantId);

    // Move 'COMBAT.CombatantUpdate' to just before 'COMBAT.CombatantRemove'
    const updateIndex = contextMenu.findIndex(m => m.name === 'COMBAT.CombatantUpdate');
    const updateEntry = contextMenu.at(updateIndex);
    contextMenu.splice(updateIndex, 1);
    contextMenu.splice(contextMenu.findIndex(m => m.name === 'COMBAT.CombatantRemove'), 0, updateEntry);

    // Changes existing buttons.
    const rerollIndex = contextMenu.findIndex(m => m.name === 'COMBAT.CombatantReroll');
    if (~rerollIndex) {
      contextMenu[rerollIndex].icon = YZEC.Icons.cards;
      contextMenu[rerollIndex].condition = li => {
        return (game.user.isGM ||
          getCombatant(li).isOwner && game.settings.get(MODULE_ID, SETTINGS_KEYS.ALLOW_REROLL));
      };
    }

    // Adds "Swap Initiative" context menu entry before 'COMBAT.CombatantReroll'.
    contextMenu.splice(rerollIndex, 0, {
      name: 'YZEC.CombatTracker.SwapInitiative',
      icon: YZEC.Icons.swap,
      condition: li => {
        const combatant = getCombatant(li);
        if (combatant.groupId) return false;
        return game.user.isGM &&
          game.combat.combatants.filter(c => c.initiative && !c.groupId).length > 1;
      },
      callback: async li => {
        const combatant = getCombatant(li);
        const template = `modules/${MODULE_ID}/templates/combat/choose-combatant-dialog.hbs`;
        const content = await foundry.applications.handlebars.renderTemplate(template, {
          combatants: game.combat.combatants.filter(c => c.initiative && !c.groupId && c.id !== combatant.id),
        });
        const targetId = await Dialog.prompt({
          title: game.i18n.localize('YZEC.CombatTracker.SwapInitiative'),
          content,
          callback: html => html.find('#initiative-swap')[0]?.value,
          options: { classes: ['dialog', game.system.id, MODULE_ID] },
        });
        const target = game.combat.combatants.get(targetId);
        if (target) combatant.swapInitiativeCard(target);
      },
    });


    // Adds "Duplicate Combatant" context menu entry before 'COMBAT.CombatantRemove'.
    const removeIndex = contextMenu.findIndex(m => m.name === 'COMBAT.CombatantRemove');
    contextMenu.splice(removeIndex, 0, {
      name: 'YZEC.CombatTracker.DuplicateCombatant',
      icon: YZEC.Icons.duplicate,
      condition: game.user.isGM,
      callback: li => {
        const c = getCombatant(li);
        return duplicateCombatant(c);
      },
    });

    const groupMenu = [];

    // 👑 Set Group Leader
    groupMenu.push({
      name: 'YZEC.CombatTracker.MakeGroupLeader',
      icon: YZEC.Icons.makeLeader,
      condition: li => {
        const c = getCombatant(li);
        return game.user.isGM && !c.isGroupLeader && c.actor?.isOwner;
      },
      callback: async li => getCombatant(li).promoteLeader(),
    });

    // 🚫 Remove Group Leader
    groupMenu.push({
      name: 'YZEC.CombatTracker.RemoveGroupLeader',
      icon: YZEC.Icons.removeLeader,
      condition: li => {
        const c = getCombatant(li);
        return game.user.isGM && c.isGroupLeader && c.actor?.isOwner;
      },
      callback: async li => getCombatant(li).unpromoteLeader(),
    });

    // 🎨 Set Group Color
    groupMenu.push({
      name: 'YZEC.CombatTracker.SetGroupColor',
      icon: YZEC.Icons.color,
      condition: li => {
        const c = getCombatant(li);
        return game.user.isGM && c.isGroupLeader && c.actor?.isOwner;
      },
      callback: li => new YearZeroCombatGroupColor(getCombatant(li)).render(true),
    });

    // 👥 Add Selected Tokens As Followers
    groupMenu.push({
      name: 'YZEC.CombatTracker.AddFollowers',
      icon: YZEC.Icons.select,
      condition: li => {
        const combatant = getCombatant(li);
        const selectedTokens = canvas?.tokens?.controlled || [];
        const followerTokens = selectedTokens?.filter(t => t.id != combatant.tokenId);
        return game.user.isGM && canvas?.ready &&
          followerTokens.length > 0 &&
          followerTokens.every(t => t.actor?.isOwner);
      },
      callback: async li => {
        const combatant = getCombatant(li);
        const selectedTokens = canvas?.tokens?.controlled;
        const followerTokens = selectedTokens?.filter(t => t.id != combatant.tokenId);

        if (followerTokens) {
          await combatant.promoteLeader();

          // Separates between new tokens and existing ones.
          const [newCombatantTokens, existingCombatantTokens] = followerTokens.partition(t => t.inCombat);

          // For new tokens, creates new combatants.
          const createData = newCombatantTokens.map(t => ({
            tokenId: t.id,
            actorId: t.actorId,
            hidden: t.hidden,
          }));

          const cmbts = await game.combat.createEmbeddedDocuments('Combatant', createData);

          // For existing combatants, just add them.
          if (existingCombatantTokens.length > 0) {
            for (const t of existingCombatantTokens) {
              const c = game.combat.getCombatantByToken(t.id);
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

    // ❌ Unfollow a Leader - static context menu implementation, see below for dynamic context menu implementation
    groupMenu.push({
      name: game.i18n.format('YZEC.CombatTracker.UnfollowLeader', { name: '' }),
      icon: YZEC.Icons.unfollow,
      condition: li => {
        const c = getCombatant(li);
        return game.user.isGM && c.groupId && !c.isGroupLeader && c.actor?.isOwner;
      },
      callback: async li => {
        const combatant = getCombatant(li);
        return combatant.update({
          initiative: null,
          [`flags.${MODULE_ID}.-=cardValue`]: null,
          [`flags.${MODULE_ID}.-=groupId`]: null,
        });
      },
    });


    // Gets group leaders to prepare follow options.

    // TODO: Update/invalidate context meny when group leaders are added/removed.
    // AppV2 context menu is static, so can't generate menu items for each leader.

    /*
    const leaders = combat.combatants.filter(c => c.isGroupLeader);
    if (leaders.size > 0) {
      for (const leader of leaders) {
        // ➰ Follow a Leader
        groupMenu.push({
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
        groupMenu.push({
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
    }
    */
    return groupMenu.concat(contextMenu);
  }

  /* ------------------------------------------ */

  static #onCombatantControl(...args) {
    return this._onCombatantControl(...args);
  }

  /** @override */
  async _onCombatantControl(event, target) {
    await super._onCombatantControl(event, target);
    const btn = target;
    const li = btn.closest('.combatant');
    const combat = this.viewed;
    const combatant = combat.combatants.get(li.dataset.combatantId);
    const eventName = btn.dataset.event;
    const property = btn.dataset.action;
    const eventData = {
      combat,
      combatant,
      property,
      event: eventName,
      origin: btn,
    };

    if (Object.values(STATUS_EFFECTS).includes(property)) {
      const effect = CONFIG.statusEffects.find(e => e.id === property);
      const active = !combatant[property];
      if (!active) await combatant.unsetFlag(MODULE_ID, property);
      await combatant.token.actor.toggleStatusEffect(effect.id, { active });
    }
    else if (property) {
      await combatant.setFlag(MODULE_ID, property, !combatant.getFlag(MODULE_ID, property));
    }

    { YearZeroCombatTracker.#callHook(eventData); }
  }

  /* ------------------------------------------ */

  async #removeFromGroup(combatant) {
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

  /**
   * @param {YearZeroCombatant} combatant
   * @override
   */
  async _onToggleDefeatedStatus(combatant) {
    await combatTrackerOnToggleDefeatedStatus(combatant);
    if (combatant.isGroupLeader && combatant.isDefeated) {
      await this.#removeFromGroup(combatant);
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

  /* @override */
  async _renderHTML(context, options) {
    const rendered = await super._renderHTML(context, options);
    const tracker = rendered.tracker;

    // Makes combatants draggable for the GM.
    tracker.querySelectorAll('li.combatant').forEach((li, _i) => {
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
    return rendered;
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
    const trackers = [this.element];
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

        if (game.settings.get(MODULE_ID, SETTINGS_KEYS.SHOW_AMBUSHED)) {
          cfg.buttons.unshift(...YZEC.CombatTracker.DefaultCombatantControls.ambushed);
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
  static #setTurnProperties(combatant, turn) {
    const flags = combatant.flags[MODULE_ID];
    // FIXME: Figure out why these turn up as flags.
    delete flags.fastAction;
    delete flags.slowAction;
    delete flags.action1;
    delete flags.action2;
    delete flags.action3;
    delete flags.action4;
    delete flags.action5;
    delete flags.action6;
    delete flags.action7;
    delete flags.action8;
    delete flags.action9;
    const statuses = combatant.actor?.statuses.reduce((acc, s) => {
      acc[s] = true;
      return acc;
    }, flags) || flags;
    return {
      ...statuses,
      emptyInit: !!combatant.groupId || turn.isDefeated,
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
