// MIT License (c) 2022 Paulo Henrique (PH#2526)

const items = {

  // Requires: Item Macro, JB2A, Midi QoL ("preItemRoll"), Sequencer
  bootsOfSpeed(args) {
    const {actor, token, item} = feanor.utils.getContext(args);

    if ( args[0].tag === "OnUse" ) {
      const speedEffectData = item.effects.find(e => e.duration.rounds)?.toObject();
      const disadvEffectData = item.effects.find(e => !e.duration.rounds)?.toObject();
      if ( !speedEffectData || !disadvEffectData ) return ui.notifications.error("Failed to find required active effect data.");
      speedEffectData.duration.rounds = item.system.uses.value;

      const existingEffects = actor.effects.filter(e => e._sourceName === item.name);
      if ( existingEffects.length ) {
        for ( const effect of existingEffects ) effect.delete();
      } else {
        actor.createEmbeddedDocuments("ActiveEffect", [speedEffectData, disadvEffectData]);
        new Sequence()
          .effect("jb2a.energy_strands.complete.blue.01")
            .atLocation(token)
            .attachTo(token)
            .size(token.document.width + 1, {gridUnits: true})
            .fadeIn(500)
            .fadeOut(500)
          .sound("modules/feanor/assets/transformation.wav")
            .delay(200)
          .play();
      }

      return false;
    }

    if ( args[0] === "each" ) {
      item.update({"system.uses.value": item.system.uses.value - 1});
    }
  }

};

export default items;
