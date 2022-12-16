import { YZEC } from '@module/config';

export function addSlowAndFastStatusEffects() {
  CONFIG.statusEffects.push(...YZEC.StatusEffects.slowAndFastActions);
}

export async function removeActions(token) {
  const statusIds = YZEC.StatusEffects.slowAndFastActions.map(e => e.id);
  for (const e of token.actor.effects) {
    if (statusIds.includes(e.getFlag('core', 'statusId'))) {
      await e.delete();
    }
  }
}
