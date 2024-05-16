import { YZEC } from '@module/config';

export function addSlowAndFastStatusEffects() {
  CONFIG.statusEffects.push(...YZEC.StatusEffects.slowAndFastActions);
}

export function addSingleActionStatusEffect() {
  CONFIG.statusEffects.push(YZEC.StatusEffects.singleAction);
}
