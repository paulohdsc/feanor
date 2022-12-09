# Fëanor Dragorion - D&D 5e Character Automation
A simple Foundry Virtual Tabletop module created to provide automation for some features of the Fëanor Dragorion character, a D&D 5e Draconic Bloodline Sorcerer currently at level 10.

## How to Use
The module creates a global object named `feanorDragorion`, containing the automation functions sorted by category. Create an item macro in the desired feature sheet invoking the respective function with the required arguments. Call it from Midi QoL's On Use Macro on the item sheet, by adding ItemMacro (case-sensitive) in the macro field. Example:
```
feanorDragorion.features.flexibleCasting(args);
```

## Required Modules
* Item Macro
* Midi QoL
* Dynamic effects using Active Effects (DAE)

## To-do list
* Update module dependencies
* Add manifest and download links
* Revise scripts required modules