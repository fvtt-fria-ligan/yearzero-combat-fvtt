
<center>
<h1>Year Zero Engine: Combat</h1>
<p>A module that adds YZE combat mechanics to a game system!</p>
</center>

# What's in the Box
- Default initiative deck and discard pile (if none are provided by the game system or any other module)
- Combat initiative is card draw based
- Combat initiative order is ascending (lowest first)
- Initiative groups are supported *(1 card for multiple combatants, create groups with right-click or drag'n-drop)*
- Combatant cloning is supported *(one token can have multiple initiative entries in a combat instance, useful for monsters with Speed > 1)*
- Redrawing initiative at the start of each round is supported
- Swap initiative cards between two combatants
- Buttons for actions (single or fast/slow)
- Combatant configuration *(how many cards to draw, keep best or worst, etc.)*
- Module settings *(everything is customizable by the GM)*
- Developer options for customization

# For Gamemasters

Go to the module's settings, and add the ID or name of the initiative deck you want to use.

# For Developers

## Hooks

Listen for the following Hook to add your own YZE Combat's configuration:

```js
Hooks.once('yzeCombatInit', async yzec => {
  // Sets the initiative deck's ID or name in the game settings.
  // If you don't, a new default one will be created and linked in the settings.
  await yzec.setInitiativeDeck('azerty0123456789');

  // You can also define more settings.
  await yzec.register({
    // Sets the value that defines the speed of the combatant.
    actorSpeedAttribute: 'system.speed.value',
    // Sets the value that defines how many cards are drawn by the combatant.
    actorDrawSizeAttribute: 'system.fastReflexes.value',
    // etc...
  });
});
```

> **Note**: See the `src/utils/client-hooks.js` script file for more information on configurating this module. The list of available config keys are in the `src/module/constants.js` script file, under the `SETTING_KEYS` constant.

## Customizing the Combat Tracker

The Combat Tracker in the sidebar can be configured with your own combatant controls' buttons and context menu entries with a JSON configuration file. It's schema can be found in `schemas/combat-tracker.schema.json`.

Use the init Hook to set the path to your own config file:

```js
Hooks.once('yzeCombatInit', async yzec => {
  yzec.setSourceForCombatTrackerPreset('./path-to-my/combat-tracker-config.json');
});
```

### Config JSON File

<!-- TODO -->

```jsonc
// Example
{
  "$schema": "../../schemas/combat-tracker.schema.json",
  "buttons": [],
  "controls": []
}
```

<!-- ### Custom Combatant's Controls Buttons and Context Menu Entries -->

<!-- TODO -->

### Socket Events

Clicking a custom button or menu entry will emit an event that you can capture.

The name of the triggered event is equal to the `eventName` property prepended with "`yze-combat.`" to prevent conflicts with other events. *E.g.* `'Hooks.on('yze-combat.foo', data => {...})`

## Classes

The following Foundry documents are replaced:
- **Cards:** YearZeroCards
- **Combatant:** YearZeroCombatant
- **Combat:** YearZeroCombat
- **CombatTracker:** YearZeroCombatTracker

# Contributing

## Setup

```bash
# Install the Node packages
npm install

# Build the distribution
npm run dev

# Then link the project
# Unix
ln -s dist/* /absolute/path/to/foundry/data/module-name

# Windows
mklink /J /absolute/path/to/link /absolute/path/to/this/repo/dist
```

# License

MIT

This module contains parts of the [SWADE](https://gitlab.com/peginc/swade) game system licensed under the Apache 2.0 license. Permission was granted by its developer, [FloRad](https://gitlab.com/florad92).
