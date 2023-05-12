/* eslint-disable jsdoc/require-jsdoc */

export function filterDatabase(database, damageType) {
  const filtered = deepClone(database);
  for ( const [k1, v1] of Object.entries(database) ) {
    for ( const [k2, v2] of Object.entries(v1) ) {
      if ( k2.endsWith("$") ) {
        filtered[k1][k2] = v2[damageType];
      } else {
        filtered[k1][k2] = v2;
      }
    }
  }
  return filtered;
}

// A reduced version of Item5e#rollDamage specialized in spells
export function getSpellDamageRoll(item, spellLevel, critical) {
  if ( !item.hasDamage ) throw new Error("You may not make a Damage Roll with this Item.");

  // Get roll data
  const dmg = item.system.damage;
  const parts = dmg.parts.map(d => d[0]);
  const rollData = item.getRollData();
  if ( spellLevel ) rollData.item.level = spellLevel;

  // Scale damage from up-casting spells
  const scaling = item.system.scaling;
  if ( scaling.mode === "cantrip" ) {
    let level;
    if ( item.actor.type === "character" ) level = item.actor.system.details.level;
    else if ( item.system.preparation.mode === "innate" ) level = Math.ceil(item.actor.system.details.cr);
    else level = item.actor.system.details.spellLevel;
    item._scaleCantripDamage(parts, scaling.formula, level, rollData);
  }
  else if ( spellLevel && (scaling.mode === "level") && scaling.formula ) {
    item._scaleSpellDamage(parts, item.system.level, spellLevel, scaling.formula, rollData);
  }

  // Add damage bonus formula
  const actorBonus = getProperty(item.actor.system, `bonuses.${item.system.actionType}`) || {};
  if ( actorBonus.damage && (parseInt(actorBonus.damage) !== 0) ) {
    parts.push(actorBonus.damage);
  }

  // Returns a Promise which resolves to the DamageRoll instance
  const formula = parts.join(" + ");
  const actorRollData = item.actor.getRollData();
  return new CONFIG.Dice.DamageRoll(formula, actorRollData, {critical}).evaluate({async: true});
}

// TODO: Remove dependencie from this method and delete it
export function getContext(args) {
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

export function preload(database) {
  const flatObj = flattenObject(database);
  for ( const [k, v] of Object.entries(flatObj) ) {
    if ( Array.isArray(v) ) flatObj[k] = {...v};
  }
  const flatArray = Object.values(flattenObject(flatObj));
  const srcArray = flatArray.filter(value => typeof value === "string" && value);
  return Sequencer.Preloader.preloadForClients(srcArray);
}

export function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
