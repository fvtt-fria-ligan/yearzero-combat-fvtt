import { YZEC } from '@module/config';

export function addSlowAndFastStatusEffects() {
  CONFIG.statusEffects.push(...YZEC.StatusEffects.slowAndFastActions);
}
