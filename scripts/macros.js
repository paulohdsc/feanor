/* eslint-disable jsdoc/require-jsdoc */

import {flexibleCasting} from "./features/flexible-casting.js";
import {transmutedSpell} from "./features/transmuted-spell.js";
import {twinnedSpell} from "./features/twinned-spell.js";
import {bootsOfSpeed} from "./items/boots-of-speed.js";
import {ashardalonsStride} from "./spells/ashardalons-stride.js";
import {chainLightning} from "./spells/chain-lightning.js";
import {disintegrate} from "./spells/disintegrate.js";

export const features = {flexibleCasting, transmutedSpell, twinnedSpell};
export const items = {bootsOfSpeed};
export const spells = {ashardalonsStride, chainLightning, disintegrate};
export const utils = {getContext, preload, wait};

// import {draft} from "./draft.js";
// utils._draft = draft;

// TODO: Remove dependencie from this method and delete it
function getContext(args) {
  const lastArg = args[args.length - 1];
  const doc = fromUuidSync(lastArg.actorUuid);
  const actor = doc instanceof TokenDocument ? doc.actor : doc;
  const token = fromUuidSync(lastArg.tokenUuid)?.object;
  const item = fromUuidSync(lastArg.itemUuid ?? lastArg.origin);
  const spellLevel = lastArg.spellLevel;
  const targets = lastArg.targets;
  const hitTargets = lastArg.hitTargets;
  return {lastArg, actor, token, item, spellLevel, targets, hitTargets};
}

function preload(obj) {
  const flatObj = flattenObject(obj);
  for ( const [k, v] of Object.entries(flatObj) ) {
    if ( Array.isArray(v) ) flatObj[k] = {...v};
  }
  const flatArray = Object.values(flattenObject(flatObj));
  const srcArray = flatArray.filter(value => typeof value === "string" && value);
  return Sequencer.Preloader.preloadForClients(srcArray);
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
