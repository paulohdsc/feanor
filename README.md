# Fëanor Dragorion - D&D 5e Character Automation
A Foundry Virtual Tabletop module created to provide automation for some features of the character Fëanor Dragorion, a D&D 5e draconic bloodline sorcerer currently at level 12.

## Instructions
This module creates a global object named `feanor`, containing the automation functions sorted by category. Midi QoL allows us to directly invoke those global functions via OnUse Macro fields on item or actor sheets, using the sintax `function.functionName`. Example:
```js
function.feanor.features.flexibleCasting
```
Use Midi QoL to call the respective methods on item use. See the function comments for additional details.

## Required Modules
- DAE
- Effect Macro
- Midi QoL
- Sequencer

## Recommended Modules
- JB2A
- Simple Calendar
- SoundFx Library
- Times Up

## To-do
- [ ] Update module dependencies
- [ ] Insert Forgotten Adventures attribution
- [ ] On v11, update module.json to use the new `relationships.recommends`
- [ ] Disable "require documentation" and add code comments