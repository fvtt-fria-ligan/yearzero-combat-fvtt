import { YZEC } from '@module/config';
import { MODULE_ID, SETTINGS_KEYS } from '@module/constants';

export function addSlowAndFastStatusEffects() {
  CONFIG.statusEffects.push(...YZEC.StatusEffects.slowAndFastActions);
}

export function addSingleActionStatusEffect() {
  CONFIG.statusEffects.push(...YZEC.StatusEffects.singleAction);
}

export function onRenderTokenHUD(_app, html, options) {
  const key = game.settings.get(MODULE_ID, SETTINGS_KEYS.ACTOR_SPEED_ATTRIBUTE);
  const speed = foundry.utils.getProperty(options.delta, key)
  || foundry.utils.getProperty(game.actors.get(options.actorId), key)
  || 1;

  // Remove unused single action status effects from HUD
  for (let i = 1 + speed; i <= 9; i++) {
    const effects = html.find(`.effect-control[data-status-id="action${i}"]`);
    effects.remove();
  }
}
