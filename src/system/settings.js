// ? scope: world (gm), client (player)
// ? config: true (visible)

import { MODULE_NAME } from './constants.js';

export function registerSystemSettings() {
  const sysName = MODULE_NAME;

  game.settings.register(sysName, 'moduleMigrationVersion', {
    name: 'Module Migration Version',
    scope: 'world',
    config: false,
    type: String,
    default: '',
  });
}
