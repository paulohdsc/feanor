# Fëanor Dragorion - D&D 5e Character Automation
A simple Foundry Virtual Tabletop module created to provide automation for some features of the Fëanor Dragorion character, a D&D 5e Draconic Bloodline Sorcerer currently at level 10.

## Instructions
The module creates a global object named `feanorDragorion`, containing the automation functions sorted by category. To run a given automation, create an item macro in the feature sheet, calling the respective method in it. Example:
```
feanorDragorion.features.flexibleCasting(args);
```
Then add `ItemMacro` (case-sensitive) in the Midi QoL On Use Macro field on the sheet and roll the item. Look at the function comments for some additional configuration details.

## Required Modules
* Item Macro
* Midi QoL
* Dynamic effects using Active Effects (DAE)

## To-do list
* Update module dependencies
* Add manifest and download links
* Revise scripts required modules
* Clear Chrome DevTools Snippets