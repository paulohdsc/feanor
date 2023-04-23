const items = {

  // Issue fvtt: get sourceName do not await ActiveEffect._getSourceName;
  // Issue dnd5e: add sheet indicator when item has active effect;

  // Modules: Effect Macro, JB2A, Midi QoL ("preItemRoll"), Sequencer, Times Up
  // OnUse Macro: function.return feanor.items.bootsOfSpeed
  // Effect Macros: feanor.items.bootsOfSpeed({args: "onDelete", token});
  //                feanor.items.bootsOfSpeed({args: "onTurnStart", actor, item: origin});
  //                feanor.items.bootsOfSpeed({args: "onTurnEnd", actor});
  async bootsOfSpeed({actor, token, item, args}) {
    const speedEffectName = "2x walking speed";
    const disadvEffectName = "Imposes disadvantage on OAs";
    if ( args[0]?.tag === "OnUse" ) {
      const appliedEffects = actor.effects.filter(e => e.origin === item.uuid);
      if ( appliedEffects.length ) {
        for ( const effect of appliedEffects ) effect.delete();
      } else {
        const speedEffectData = item.effects.find(e => e.label === speedEffectName)?.toObject();
        const disadvEffectData = item.effects.find(e => e.label === disadvEffectName)?.toObject();
        if ( !speedEffectData || !disadvEffectData ) {
          ui.notifications.error(`Failed to find required active effect on ${item.name}.`);
          return false;
        }
        speedEffectData.duration.rounds = item.system.uses.value;
        actor.createEmbeddedDocuments("ActiveEffect", [speedEffectData, disadvEffectData]);
        playSequence(token);
      }
      return false;
    }
    if ( args === "onTurnStart" ) {
      const disadvEffect = actor.effects.find(e => e.label === disadvEffectName);
      if ( disadvEffect?.disabled ) disadvEffect.update({disabled: false});
      item?.update({"system.uses.value": item.system.uses.value - 1});
    }
    if ( args === "onTurnEnd" ) {
      const disadvEffect = actor.effects.find(e => e.label === disadvEffectName);
      if ( disadvEffect && !disadvEffect.disabled ) disadvEffect.update({disabled: true});
    }
    if ( args === "onDelete" ) {
      playSequence(token);
    }

    /**
     * Play sound and visual effects for the item
     * @param {Token} token         The Token of the item owner
     */
    async function playSequence(token) {
      if ( !token ) return;
      const {boots_of_speed} = feanor.database;
      await feanor.utils.preload(boots_of_speed);
      new Sequence({moduleName: "Fëanor", softFail: true})
        .effect(boots_of_speed.effects.transmute)
          .atLocation(token)
          .attachTo(token)
          .size(token.document.width + 1, {gridUnits: true})
          .fadeIn(500)
          .fadeOut(500)
        .sound(boots_of_speed.sounds.transmute)
          .delay(200)
        .play();
    }
  }

};

export default items;
