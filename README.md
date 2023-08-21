# Fëanor Dragorion - D&D 5e Character Automation
A Foundry Virtual Tabletop module created to provide automation for some features of the character Fëanor Dragorion, a D&D 5e draconic bloodline sorcerer currently at level 14.

## Instructions
This module creates a global object named `feanor`, containing the automation functions sorted by category. Midi QoL allows us to directly invoke those global functions via *On Use Macro* fields on item or actor sheets, using the sintax `function.functionName`. Example:
```
function.feanor.features.flexibleCasting
```
Use Midi QoL to call the respective methods on item use. See function comments for additional details.

## Required Modules
- DAE
- Effect Macro
- Midi QoL
- Sequencer
- Token Magic FX
- Warp Gate

## Recommended Modules
- Automated Animations
- Build-a-Bonus
- JB2A
- Simple Calendar
- SoundFx Library
- Times Up