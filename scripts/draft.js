/* eslint-disable jsdoc/require-jsdoc, jsdoc/require-param, quote-props */

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

// import {db as database} from "./database.js";
// const main = async () => { // Use with Midi OnUseMacro + world macro or with Core macro.execute()
function main({actor, token, item, args}) { // Use with Midi OnUseMacro + global function

  // Created inside main's scope in order to take advantage of the closure
  function createDialog() {
  }

}

// Create outside main's scope in order to be exported
function dismissDraconicSpirit() {
}

// export const summonDraconicSpirit = {main, dismissDraconicSpirit};
// main();
// return main();
