import { YZEC } from '@module/config';

export function addSlowAndFastStatusEffects() {
  CONFIG.statusEffects.push(...YZEC.StatusEffects.slowAndFastActions);
}

export async function removeSlowAndFastActions(token) {
  const statusIds = YZEC.StatusEffects.slowAndFastActions.map(e => e.id);
  const effects = token?.actor?.effects || [];
  for (const e of effects) {
    if (statusIds.includes(e.getFlag('core', 'statusId'))) {
      await e.delete();
    }
  }
}
