# Fëanor Dragorion Automation
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
- JB2A
- Midi QoL
- Sequencer
- Token Magic FX
- Warp Gate

## Recommended Modules
- D&D5e Animations
- SoundFx Library
- Times Up