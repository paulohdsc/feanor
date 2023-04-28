import {db as database} from "./database.js";
// import {draft} from "./draft.js";
import {features, items, spells, utils} from "./macros.js";

globalThis.feanor = {
  database,
  features,
  items,
  spells,
  utils
};

Hooks.once("init", () => {
  game.settings.register("feanor", "actorId", {
    name: "Fëanor Dragorion's Actor Id",
    scope: "world",
    default: "",
    config: true,
    requiresReload: true,
    type: String
  });
});

// Hooks.once("ready", () => {
//   const actorId = game.settings.get("feanor", "actorId");
//   const actor = game.actors.get(actorId);
//   if ( !actor?.flags.world ) return;
//   const flags = Object.entries(actor.flags.world).filter(f => "events" in f[1]);
//   // console.log("%cFLAG", "color:yellow", flags);
//   for ( const flag of flags ) {
//     for (let step = 0; step < flag[1].events.length; step++) {
//       Hooks.on("preUpdateToken", feanor.spells[`${flag[0]}`][`${flag[1].events[step].fn}`]);
//       // console.log(feanor.spells[`${flag[0]}`][`${flag[1].events[step].fn}`]);
//     }
//   }
// });
