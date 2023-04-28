/**
 * Disintegrate | 6th-level transmutation | PHB pg. 233
 * Modules: JB2A, Midi QoL ("postActiveEffects"), Sequencer
 * Usage: function.feanor.spells.disintegrate
 * @param {object} [midiHelpers]        Helper variables provided by Midi QoL
 * @param {Token} [midiHelpers.token]   The actor's token on the scene
 */
export async function disintegrate({token}) {
  const {disintegrate} = feanor.database;
  await feanor.utils.preload(disintegrate);
  const sequence = new Sequence({moduleName: "Fëanor", softFail: true}).sound(disintegrate.sounds.projectile);
  for ( const target of this.targets ) {
    sequence
      .effect()
        .file(disintegrate.effects.projectile)
        // .attachTo(token)
        // .stretchTo(target, {attachTo: true});
        .atLocation(token)
        .stretchTo(target);
    if ( target.actor.system.attributes.hp.value > 0 ) continue;
    sequence
      .effect()
        .delay(1650)
        .file(disintegrate.effects.impact)
        .atLocation(target)
        .scaleToObject(2)
        .randomRotation()
        .filter("ColorMatrix", {hue: 220})
      .effect()
        .delay(1650)
        .file(disintegrate.effects.pile_of_dust)
        .atLocation(target)
        .belowTokens()
        .scaleToObject()
        .filter("ColorMatrix", {contrast: 1, saturate: -1})
        .persist()
      .animation()
        .delay(1750)
        .on(target)
        .opacity(0)
        .hide();
  }
  sequence.play();
}
