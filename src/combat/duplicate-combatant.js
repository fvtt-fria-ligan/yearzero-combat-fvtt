export async function combatTrackerOnToggleDefeatedStatus(combatant) {
  const isDefeated = combatant.isDefeated;
  for (const c of _getCombatantsSharingToken(combatant)) {
    await c.update({ defeated: isDefeated });
  }
}

export async function tokenOnHoverIn(event, options) {
  const combatant = this.combatant;
  if (combatant) {
    const tracker = document.getElementById('combat-tracker');
    for (const c of _getCombatantsSharingToken(combatant)) {
      const li = tracker.querySelector(`.combatant[data-combatant-id="${c.id}"]`);
      if (li) li.classList.add('hover');
    }
  }
}

export async function tokenOnHoverOut(event) {
  const combatant = this.combatant;
  if (combatant) {
    const tracker = document.getElementById('combat-tracker');
    for (const c of _getCombatantsSharingToken(combatant)) {
      const li = tracker.querySelector(`.combatant[data-combatant-id="${c.id}"]`);
      if (li) li.classList.remove('hover');
    }
  }
}

/**
 * @param {Combatant} combatant
 * @returns {Combatant[]}
 */
function _getCombatantsSharingToken(combatant) {
  const combatantTokenIds = combatant.actor.getActiveTokens(false, true).map(t => t.id);
  return combatant.parent.combatantTokenIds
    .filter(c => combatantTokenIds.includes(c.tokenId));
}
