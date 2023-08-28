import {db as database} from "./database.js";
import {flexibleCasting} from "./features/flexible-casting.js";
import {transmutedSpell} from "./features/transmuted-spell.js";
import {twinnedSpell} from "./features/twinned-spell.js";
import {bootsOfSpeed} from "./items/boots-of-speed.js";
import {ashardalonsStride} from "./spells/ashardalons-stride.js";
import {chainLightning} from "./spells/chain-lightning.js";
import {disintegrate} from "./spells/disintegrate.js";
import * as utils from "./utils.js";

const features = {flexibleCasting, transmutedSpell, twinnedSpell};
const items = {bootsOfSpeed};
const spells = {ashardalonsStride, chainLightning, disintegrate};

globalThis.feanor = {
  database,
  features,
  items,
  spells,
  utils
};

// import {draft} from "./draft.js";
// globalThis.feanor.draft = draft;

Hooks.once("init", () => {
  // Allow controller user to be changed midgame with game.settings.set()
  game.settings.register("feanor", "userName", {
    name: "Fëanor Dragorion's User Name",
    scope: "world",
    default: "PH",
    type: String
  });
});

Hooks.once("ready", () => {
  const userName = game.settings.get("feanor", "userName");
  if ( game.user.name !== userName ) return;
  const actor = game.user.character;
  if ( !actor?.flags.world ) return;
  const flags = Object.values(actor.flags.world).filter(f => "events" in f);
  for ( const f of flags ) {
    for (let i = 0; i < f.events.length; i++) {
      const fn = getProperty(feanor, `${f.events[i].fn}`);
      const hook = f.events[i].hook;
      const trigger = f.events[i].once ? "once" : "on";
      Hooks[trigger](hook, fn);
    }
  }
});
