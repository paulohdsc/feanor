/* eslint-disable jsdoc/require-param */

// BUG core: get sourceName do not await ActiveEffect._getSourceName;
//           see https://github.com/foundryvtt/foundryvtt/issues/9332
//           workaround: ignore the getter, and rely solely on _getSourceName()
//           corrected on Foundry v11
// Issue dnd5e: add sheet indicator when item has active effect

/**
 * Boots of Speed | Wondrous item | DMG pg. 155
 * Modules: Effect Macro, JB2A, Midi QoL ("preItemRoll"), Sequencer, Times Up
 */
export async function bootsOfSpeed({actor, token, item, args, trigger}) {
  const context = args ? args[0].tag : trigger;
  const speedEffectName = "2x walking speed";
  const disadvEffectName = "Grants disadvantage on OAs";

  // OnUse Macro: function.return feanor.items.bootsOfSpeed
  if ( context === "OnUse" ) {
    // On v11 sourceName has become synchronous
    // const appliedEffects = actor.effects.filter(e => e.sourceName === item.name);
    const appliedEffects = actor.effects.filter(e => e.label === speedEffectName || e.label === disadvEffectName);
    if ( appliedEffects.length ) {
      actor.deleteEmbeddedDocuments("ActiveEffect", appliedEffects.map(e => e.id));
    } else {
      const speedEffectData = item.effects.find(e => e.label === speedEffectName)?.toObject();
      const disadvEffectData = item.effects.find(e => e.label === disadvEffectName)?.toObject();
      if ( !speedEffectData || !disadvEffectData ) {
        ui.notifications.error(`Failed to find required active effect on ${item.name}.`);
        return false;
      }

      // HACK: Ensures that AE origin will match item uuid when it is imported from other actor
      // Remove this when AE origins starts using relative ids (https://github.com/foundryvtt/foundryvtt/issues/6281)
      speedEffectData.origin = item.uuid;
      disadvEffectData.origin = item.uuid;

      speedEffectData.duration.rounds = item.system.uses.value;
      actor.createEmbeddedDocuments("ActiveEffect", [speedEffectData, disadvEffectData]);
      playSequence(token);
    }
    return false;
  }

  // Effect Macro: feanor.items.bootsOfSpeed({actor, item: origin, trigger: "onTurnStart"});
  if ( context === "onTurnStart" ) {
    const disadvEffect = actor.effects.find(e => e.label === disadvEffectName);
    if ( disadvEffect?.disabled ) disadvEffect.update({disabled: false});
    item?.update({"system.uses.value": item.system.uses.value - 1});
  }

  // Effect Macro: feanor.items.bootsOfSpeed({actor, trigger: "onTurnEnd"});
  if ( context === "onTurnEnd" ) {
    const disadvEffect = actor.effects.find(e => e.label === disadvEffectName);
    if ( disadvEffect && !disadvEffect.disabled ) disadvEffect.update({disabled: true});
  }

  // Effect Macro: feanor.items.bootsOfSpeed({token, trigger: "onDelete"});
  if ( context === "onDelete" ) {
    playSequence(token);
  }

  /**
   * Play sound and visual effects for the item
   */
  async function playSequence(source) {
    if ( !source ) return;
    const {boots_of_speed} = feanor.database;
    await feanor.utils.preload(boots_of_speed);
    new Sequence({moduleName: "Fëanor", softFail: true})
      .effect(boots_of_speed.effects.transmute)
        .atLocation(source)
        .attachTo(source)
        .size(source.document.width + 1, {gridUnits: true})
        .fadeIn(500)
        .fadeOut(500)
      .sound(boots_of_speed.sounds.transmute)
        .delay(200)
      // BUG: effect do not play when 'remote: true' and only the GM is logged
      .play(/* {remote: false} */);
  }
}
