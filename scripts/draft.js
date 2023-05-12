/* eslint-disable jsdoc/require-jsdoc */

import {db as database} from "./database.js";
console.log(database);

// const main = () => { // Use with core 'macro.execute()' or Midi OnUseMacro invoking macros
// function main({actor, token, item, args}) { // Use with Midi OnUseMacro invoking global functions
// }
// main();

/* Hypnotic Pattern
new Sequence({moduleName: "Fëanor", softFail: true})
  .effect()
    .file("upload-player/feanor/hypnotic-pattern.webp")
    .atLocation({x: 1000, y: 1500})
    .scale(0.25)
    // .filter("Glow", {distance: 1})
    // .filter("Blur", {strength: 2})
    // .loopProperty("sprite", "position.x", { from: -200, to: 200, duration: 500})
    .persist()
  // BUG: effect do not play when 'remote: true' and only the GM is logged
  .play({remote: true});
 */

/* Web Spell
actor.rollAbilityTest("str", {targetValue: 18})
 */
