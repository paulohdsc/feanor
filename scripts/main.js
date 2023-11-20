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

// import {draft} from "./draft.js"; globalThis.feanor.draft = draft;

// Register Hook callback handlers for the active features
function activateOwnerClientHooks() {
  const activeHooks = feanor.utils.getClientSettings("feanor.macroData")?.activeHooks;
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
}

// Usage: Wrap Illandril's Inventory Sorter module.js code in the 'if' statement below
// if ( !JSON.parse(globalThis.localStorage.getItem("feanor.preventIllandrilsSorter")) ) {/* code */}
function preventIllandrilsSorter() {
  const key = "feanor.preventIllandrilsSorter";
  const value = feanor.utils.getClientSettings(key);
  if ( value === null ) globalThis.localStorage.setItem(key, "true");
}

// Update the current default sheets using user preferences
function updateDefaultSheets() {
  const newDefaultSheets = {
    Actor: {
      character: "dnd5e.ActorSheet5eCharacter",
      npc: "dnd5e.ActorSheet5eNPC",
      vehicle: "dnd5e.ActorSheet5eVehicle"
    },
    Item: {
      weapon: "dnd5e.ItemSheet5e",
      equipment: "dnd5e.ItemSheet5e",
      consumable: "dnd5e.ItemSheet5e",
      tool: "dnd5e.ItemSheet5e",
      loot: "dnd5e.ItemSheet5e",
      background: "dnd5e.ItemSheet5e",
      class: "dnd5e.ItemSheet5e",
      subclass: "dnd5e.ItemSheet5e",
      spell: "dnd5e.ItemSheet5e",
      feat: "dnd5e.ItemSheet5e",
      backpack: "dnd5e.ItemSheet5e"
    }
  };
  DocumentSheetConfig.updateDefaultSheets(newDefaultSheets);
}

Hooks.once("ready", () => {
  if ( game.user.name === consts.userName ) {
    activateOwnerClientHooks();
    preventIllandrilsSorter();
  }
});

Hooks.once("canvasReady", () => {
  if ( game.user.name === consts.userName ) {
    // Move to the "ready" hook after ToD campaign
    updateDefaultSheets();
  }
});
