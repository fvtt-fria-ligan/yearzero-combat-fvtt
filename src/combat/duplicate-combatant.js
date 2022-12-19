import { MODULE_ID } from '@module/constants';

/**
 * Duplicates a combatant.
 * @param {Combatant} combatant Combatant to duplicate
 * @param {number}   [qty=1]    Number of combatant clones to create
 * @returns {Promise.<Combatant[]>}
 */
export async function duplicateCombatant(combatant, qty = 1) {
  const c = combatant.toObject();
  c.initiative = null;
  c.flags[MODULE_ID] = null;
  const combatants = new Array(qty).fill(c);
  return combatant.parent.createEmbeddedDocuments('Combatant', combatants);
}

/* ------------------------------------------ */

/**
 * Handles toggling the defeated status effect on a combatant Token.
 * @param {Combatant} combatant The combatant data being modified
 */
export async function combatTrackerOnToggleDefeatedStatus(combatant) {
  const isDefeated = !combatant.isDefeated;
  const updates = getCombatantsSharingToken(combatant)
    .map(c => ({
      _id: c.id,
      defeated: isDefeated,
    }));
  await combatant.parent.updateEmbeddedDocuments('Combatant', updates);

  // Pushes the defeated status to the token (copied from Foundry's code).
  const token = combatant.token;
  if (!token) return;
  const defeatedStatus = CONFIG.statusEffects.find(e => e.id === CONFIG.specialStatusEffects.DEFEATED);
  if (!defeatedStatus && !token.object) return;
  const effect = token.actor && defeatedStatus ? defeatedStatus : CONFIG.controlIcons.defeated;
  if (token.object) await token.object.toggleEffect(effect, { overlay: true, active: isDefeated });
  else await token.toggleActiveEffect(effect, { overlay: true, active: isDefeated });
}

/**
 * Actions that should be taken for this Placeable Object when a mouseover event occurs.
 * @param {PIXI.InteractionEvent}        _event    The triggering canvas interaction event
 * @param {{ hoverOutOthers: boolean }} [_options] Options which customize event handling
 */
export function tokenOnHoverIn(_event, _options = {}) {
  const combatant = this.combatant;
  if (combatant) {
    const tracker = document.getElementById('combat-tracker');
    for (const c of getCombatantsSharingToken(combatant)) {
      const li = tracker.querySelector(`.combatant[data-combatant-id="${c.id}"]`);
      if (li) li.classList.add('hover');
    }
  }
}

/**
 * Actions that should be taken for this Placeable Object when a mouseout event occurs.
 * @param {PIXI.InteractionEvent} _event The triggering canvas interaction event
 */
export function tokenOnHoverOut(_event) {
  const combatant = this.combatant;
  if (combatant) {
    const tracker = document.getElementById('combat-tracker');
    for (const c of getCombatantsSharingToken(combatant)) {
      const li = tracker.querySelector(`.combatant[data-combatant-id="${c.id}"]`);
      if (li) li.classList.remove('hover');
    }
  }
}

/* ------------------------------------------ */

/**
 * Gets all the combatants that share the same token.
 * @param {Combatant} combatant
 * @returns {Combatant[]}
 */
export function getCombatantsSharingToken(combatant) {
  const combatantTokenIds = combatant.actor.getActiveTokens(false, true).map(t => t.id);
  return combatant.parent.combatants
    .filter(c => combatantTokenIds.includes(c.tokenId));
}
