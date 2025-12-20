# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.6.0](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/compare/1.5.0...1.6.0) (2025-12-20)

### Bug Fixes

* 🐛 Players can't choose Draw Another Card #74 via PR #76 ([58e4bf07](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/commit/58e4bf070ed0fbc00d5173a38eb8d6c6d02fe8e8))
* 🐛 Fix/group management via PR #75 ([99643d7a](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/commit/99643d7a40d3f937239cec9ef35889122dc792e6))
* 🐛 Reset Initiative doesn't trigger reset cards via PR #77 ([a584480e](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/commit/a584480ea713d201af07d4d12b8ead27055ff108))
* 🐛 Fix/combatant config via PR #78 ([ef3dfdf3e](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/commit/ef3dfdf3e5ae1e948687613281976a62028982b3))
* 🐛 Resource doesn't update immediately for combatant duplicates #54 via PR #81 ([f41b5b38](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/commit/f41b5b387dc662336f26bf031c31aa190b75c356))
* 🐛 Combat tracker becomes unusable #79 via PR #82 ([afbdad5f](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/commit/afbdad5f81d57ae2588e3f7386b2ecd0989651b7))
* 🐛 Initiative cards not suffled in case of drawsize >1 #49 via PR #80 ([49e29eb3](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/commit/49e29eb3515a15f5c613041951dd00dbbb354573))

## [1.5.0](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/compare/1.4.0...1.5.0) (2025-08-25)

### Bug Fixes

* 🐛 Client Hooks control module configuration ([48bea18](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/commit/48bea18667c1aa4c099f25d903149ca57c089f40))

## [1.4.0](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/compare/1.3.5...1.4.0) (2025-06-23)


### Features

* ✨ Ambushed toggle makes ambushed combatants go last in the round ([9eff2f3](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/commit/9eff2f3a5013a6a7ff28ff9a0f6a3ef9e7579ac2))


### Bug Fixes

* 🐛 Better fix for Swap initiative changes turn order ([221ee2a](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/commit/221ee2a0f3117a6290f2d5585b781662edfdf01a))
* 🐛 Changed overflow from unset to visible ([015f96d](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/commit/015f96d12e0b5ca37a4dc6a88163ba31e7ff27cf))
* 🐛 Drawn card image ([205a68d](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/commit/205a68da09f030dbdd4d2d0fd67586cdedcfe3a4))
* 🐛 Duplicate cards in initiative deck ([8a17766](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/commit/8a1776622182ddb2c43c6824067e6fea49548179))
* 🐛 swap initiative changes turn order ([6fe7254](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/commit/6fe7254d529922396d64a8ebeece0fbd62583a7c))
* 🐛 Swap initiative menu item is not visible ([87b1414](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/commit/87b14142428b70cac7fbc1c822f599f88e9509f4))
* 🐛 updated EN and SV language files according to feedback. ([50faadf](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/commit/50faadf9358aced7ed8341558bc8e61fe7b0f539))

### [1.3.1](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/compare/1.3.0...1.3.1) (2024-06-06)


### Bug Fixes

* 🐛 removes error when toggling status effect ([d956655](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/commit/d9566557143c73c77b7ffdd651ffec175a496215))

## [1.3.0](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/compare/1.2.2...1.3.0) (2024-05-28)


### Features

* ✨ Add a single-action mode for the combat tracker ([#39](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/issues/39)) ([0e51865](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/commit/0e51865fe08ddbbc523957efe4f831b5994808a7))
* ✨ Fast / Slow actions tied to tokens ([#38](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/issues/38)) ([2484b0b](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/commit/2484b0b199b329fb5d4a50be70d493dbb2605015))


### Bug Fixes

* 🐛 prevent turn from changing when swapping initiative ([#40](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/issues/40)) ([69eee2c](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/commit/69eee2cc68694cf37fc9e925c732fa22ed7b71d4))

### [1.2.2](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/compare/1.2.1...1.2.2) (2023-08-26)


### Features

* Adds Swedish localization. ([3934587](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/commit/3934587347366e051e624f8ab4ec1534491af312))

### [1.2.1](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/compare/1.2.0...1.2.1) (2023-08-26)


### Bug Fixes

* 🐛 Next round problems when resetting ([a759107](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/commit/a7591073f0212affa093df04fe73ddd0e5554bed))

## [1.2.0](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/compare/1.1.0...1.2.0) (2023-08-21)


### Features

* ✨ Add lock initiative button ([52dde6e](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/commit/52dde6eb8c4eae851e00d92c4e2bb73ba71b7b61))
* ✨ Add state to combatants ([0ea4da5](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/commit/0ea4da5672811cd080c411cf50adc64488a2e454))


### Bug Fixes

* 🐛 Add conditional display to buttons ([fbfce03](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/commit/fbfce0310f9f2b11ecd78c4be320ce516df9e9d7))
* 🐛 Handle duplicates when added to started combat ([f851374](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/commit/f85137419e4bb8bc76b5e1219123569bd0b4bf71)), closes [#30](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/issues/30)
* 🐛 Locking initiative in groups ([c5549b1](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/commit/c5549b182db8eefab543379e0b785efa1dfb2977))
* 🐛 Require reload on setting Reset Each Round ([f2d7038](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/commit/f2d7038bb0f3e4930e3b03239e14211a397a9f03))

## [1.1.0](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/compare/1.0.1...1.1.0) (2023-08-18)


### Features

* ✨ Add setting and functionality for resetting each round ([b2980c9](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/commit/b2980c961977231d0af76cac2daabc076ecb669b))

### [1.0.1](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/compare/1.0.0...1.0.1) (2023-01-07)


### Features

* **Hooks:** ✨ Add Ready Hook ([a2af8b9](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/commit/a2af8b9dd156cded2b7c58e969a947e86017bd9a))


### Bug Fixes

* 🐛 Link project ([503c685](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/commit/503c68596bba9d765a66273ba013d1f3c57ce9fc))
* **Combat-tracker:** 🐛 Token hover in and out ([6fa4d5e](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/commit/6fa4d5e83f39166819240d829a4196dc497801ec)), closes [#20](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/issues/20)
* **Combatant-Config:** 🐛 Enforce max draw size ([bf30f11](https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/commit/bf30f11353acd046de75c73157a99ea9fb491451))

### 1.0.0 (2022-12-23)

* Initial release.
