# Fëanor Dragorion - D&D 5e Character Automation
A simple module created to provide macros and media files for automating some features of my D&D 5e character on Foundry Virtual Tabletop.

* Character name: Fëanor Dragorion
* Class: Draconic Bloodline Sorcerer
* Level: 10

## Usage
The module creates a global object named `feanorDragorion`, containing the automation functions that can be accessed by the actor during play. Call the respective method as ItemMacro via Midi QoL On Use Macro field on the item sheet, providing the required arguments.

Example:
```js
feanorDragorion.elementalAffinity(args);
```

## Dependencies
* Midi QOL
* Dynamic effects using Active Effects (DAE)

## To-do list
* Update module dependencies