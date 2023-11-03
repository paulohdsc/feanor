/**
 * Boots of Speed | Wondrous item | DMG pg. 155
 * Modules: Effect Macro, JB2A, Midi QoL ("preItemRoll"), Sequencer, Times Up
 *
 * Bugs: it is possible to activate the boots even with no charges left
 *       change the moment of charge consumption
 * Todo: review constants and erros
 */
export async function bootsOfSpeed({actor, token, item, args, workflow, trigger}) {
  const speedEffectName = "2x walking speed";
  const disadvEffectName = "Grants disadvantage on OAs";
  trigger = args?.[0]?.tag ?? trigger;

  if ( trigger === "OnUse" ) {
    const appliedEffects = actor.effects.filter(e => e.sourceName === item.name);
    if ( !appliedEffects.length ) {
      for ( const effect of item.effects ) {
        if ( effect.name === speedEffectName ) effect.updateSource({"duration.rounds": item.system.uses.value});
        // Ensure that AE origin matches item uuid when the item has been imported from another actor
        // Remove when AE origin starts using relative id (https://github.com/foundryvtt/foundryvtt/issues/6281)
        effect.updateSource({origin: item.uuid});
      }
      actor.createEmbeddedDocuments("ActiveEffect", item.effects._source);
      playSequence(token);
    } else {
      actor.deleteEmbeddedDocuments("ActiveEffect", appliedEffects.map(e => e.id));
      playSequence(token);
    }
    workflow.config.consumeUsage = false;
  }

  // Effect Macro: feanor.items.bootsOfSpeed({trigger: "onTurnStart", actor, item: origin});
  if ( trigger === "onTurnStart" ) {
    const disadvEffect = actor.effects.getName(disadvEffectName);
    if ( disadvEffect?.disabled ) await disadvEffect.update({disabled: false}, {render: false});
    item?.update({"system.uses.value": item.system.uses.value - 1});
  }

  // Effect Macro: feanor.items.bootsOfSpeed({trigger: "onTurnEnd", actor});
  if ( trigger === "onTurnEnd" ) {
    const disadvEffect = actor.effects.getName(disadvEffectName);
    if ( disadvEffect && !disadvEffect.disabled ) disadvEffect.update({disabled: true});
  }

  // Effect Macro: feanor.items.bootsOfSpeed({trigger: "onDelete", actor, token});
  // if ( trigger === "onDelete" ) {
  //   const disadvEffect = actor.effects.getName(disadvEffectName);
  //   if ( disadvEffect ) disadvEffect.delete();
  //   playSequence(token);
  // }

  // Effect Macro: feanor.items.bootsOfSpeed({trigger: "onCombatEnd", actor, item: origin, token});
  if ( trigger === "onCombatEnd" ) {
    const appliedEffects = actor.effects.filter(e => e.sourceName === item.name);
    actor.deleteEmbeddedDocuments("ActiveEffect", appliedEffects.map(e => e.id));
    playSequence(token);
  }

  // Play sound and visual effects for the item
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
