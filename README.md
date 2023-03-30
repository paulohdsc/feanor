# Fëanor Dragorion - D&D 5e Character Automation
A Foundry Virtual Tabletop module created to provide automation for some features of the character Fëanor Dragorion, a D&D 5e Draconic Bloodline sorcerer currently at level 12.

## Instructions
The module creates a global object named `feanor`, containing the automation functions sorted by category. Use Midi QoL to call the respective method on item roll using item or actor OnUse Macro fields. Look at function comments for additional details. Example:
```
function.return feanor.features.flexibleCasting
```

## Required Modules
- Dynamic effects using Active Effects (DAE)
- Midi QoL

## Recommended Modules
- SoundFx Library
- Times Up

## To-do
- [ ] Update module dependencies
- [ ] Add manifest and download links
- [ ] Revise scripts required modules
- [ ] On v11, update module.json to use the new `relationships.recommends`
- [ ] Insert Forgotten Adventures attribution
- [ ] Rename module from "feanor-dragorion" to "feanor" (simplify flag scope name)