import {db as database} from "./database.js";
import {flexibleCasting} from "./features/flexible-casting.js";
import {transmutedSpell} from "./features/transmuted-spell.js";
import {twinnedSpell} from "./features/twinned-spell.js";
import {bootsOfSpeed} from "./items/boots-of-speed.js";
import {ashardalonsStride} from "./spells/ashardalons-stride.js";
import {chainLightning} from "./spells/chain-lightning.js";
import {disintegrate} from "./spells/disintegrate.js";
import {summonDraconicSpirit} from "./spells/summon-draconic-spirit.js";
import * as utils from "./utils.js";

const features = {flexibleCasting, transmutedSpell, twinnedSpell};
const items = {bootsOfSpeed};
const spells = {ashardalonsStride, chainLightning, disintegrate, summonDraconicSpirit};
const consts = {
  actorName: "Fëanor Dragorion",
  userName: "PH"
};

globalThis.feanor = {
  consts,
  database,
  features,
  items,
  spells,
  utils
};

// import {draft} from "./draft.js";
// globalThis.feanor.draft = draft;

// TODO: implement socket interface for registering Hooks to other clients
Hooks.once("ready", () => {
  const activeHooks = feanor.utils.getClientSettings("feanor.macroData")?.activeHooks;
  if ( game.user.name !== consts.userName || !activeHooks ) return;
  for ( const feature in activeHooks ) {
    const hooks = Object.entries(activeHooks[feature]);
    for ( const hook of hooks ) {
      const event = hook[0];
      const fn = foundry.utils.getProperty(globalThis, hook[1].fn);
      const option = hook[1].once ? "once" : "on";
      if ( !fn ) continue;
      Hooks[option](event, fn);
    }
  }
});
