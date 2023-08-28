/* eslint-disable jsdoc/require-param */
/* eslint-disable jsdoc/require-jsdoc */

/**
 * Ashardalon's Stride | 3rd-level transmutation | FTD pg. 19
 * Modules: DAE, Effect Macro, JB2A, Midi QoL ("preItemRoll" and "preDamageRoll"),
 *          Sequencer, SoundFx Library and Times Up
 * Usage: For the 'trail sequence' to play, the character must be selected under User Configuration
 */
function main({actor, token, item, args}) {
  /**
   * To do: Improve macro with Drag Ruler?
   *        const size = Math.floor(Math.random() * (2 - 1.5 + 1) + 1.5);
   * Issues: SnowflakeBurst missing in the JB2A database
   *         Insert optional chaining: event?.findSplice (foundry.js: 657)
   */
  if ( args[0]?.macroPass === "preItemRoll" ) {
    if ( args[0].targets.length > 1 || args[0].targets[0].id !== args[0].tokenId ) {
      ui.notifications.warn("You must target only the caster's token.");
      return false;
    } else {
      actor.effects.find(e => e.origin === item.uuid)?.delete();
    }
  }
  if ( args[0]?.macroPass === "preDamageRoll" ) {
    const damageType = item.system.damage.parts[0][1];
    if ( token ) playCastingSequence(token, damageType);
    Hooks.once(`midi-qol.preDamageRoll.${args[0].uuid}`, () => false); // OR this.systemCard = true;
    Hooks.off("preUpdateToken", playTrailSequence);
    Hooks.on("preUpdateToken", playTrailSequence);
    this.next(15); // Apply dynamic effects
    actor.update({
      "system.attributes.movement": getNewMovement(actor, args[0].spellLevel),
      flags: {
        world: {
          ashardalonsStride: {
            damageType,
            damagedTargets: [],
            events: [
              {
                fn: "spells.ashardalonsStride.playTrailSequence",
                hook: "preUpdateToken",
                once: false
              }
            ],
            itemId: item.id,
            spellLevel: args[0].spellLevel
          }
        }
      }
    });
  }
  // Clear damaged targets "onTurnEnd" to allow for readied move damage as a reaction
  if ( args === "onTurnEnd" || args === "onTurnStart" || args === "onEnable" ) {
    actor.setFlag("world", "ashardalonsStride.damagedTargets", []);
    if ( args === "onEnable" ) ui.notifications.info("Damaged targets list was cleared.");
  }
  if ( args === "onDelete" ) {
    Hooks.off("preUpdateToken", playTrailSequence);
    if ( actor.flags.world?.ashardalonsStride ) {
      const spellLevel = actor.flags.world.ashardalonsStride.spellLevel;
      actor.update({
        "system.attributes.movement": getNewMovement(actor, spellLevel, true),
        "flags.world.-=ashardalonsStride": null
      });
    }
  }
}

function getNewMovement(actor, spellLevel, subtract) {
  const movement = Object.entries(actor._source.system.attributes.movement).filter(e => typeof e[1] === "number");
  const newMovement = {};
  let modifier = 20 + (5 * (spellLevel - 3));
  if ( subtract ) modifier *= -1;
  for ( const speed of movement ) {
    if ( speed[1] > 0 ) newMovement[speed[0]] = speed[1] + modifier;
  }
  return newMovement;
}

// See .playIf(boolean) or .playIf(inFunction)
// See .filter(string, object)
// See .tint() or .tint(hexadecimal) or .tint(decimal)
// See .addOverride(async (effect, data) => {/*do stuf*/; return data;})
async function playCastingSequence(source, damageType) {
  const ashardalons_stride = feanor.utils.filterDatabase(feanor.database.ashardalons_stride, damageType);
  await feanor.utils.preload(ashardalons_stride);
  new Sequence({moduleName: "Fëanor", softFail: true})
    .sound()
      .file(ashardalons_stride.sounds.chant)
    .effect()
      .file(ashardalons_stride.effects.magic_circle)
      .atLocation(source, {cacheLocation: true})
      .belowTokens()
      .size(source.document.width + 2, {gridUnits: true})
      .animateProperty("sprite", "rotation", {from: 0, to: 180, duration: 2000, ease: "easeInOutCubic"})
    .wait(4000)
    .sound()
      .file(ashardalons_stride.sounds.on_cast_$)
    .effect()
      .file(ashardalons_stride.effects.on_cast_$)
      .atLocation(source)
      .attachTo(source)
      .belowTokens()
      .size(source.document.width + 1, {gridUnits: true})
      .fadeIn(500)
      .fadeOut(500)
    // BUG: .wait() is preventing serialization; when/if fixed, change to .play({remote: true})
    .play();
}

async function playTrailSequence(tokenDoc, change) {
  if ( !("x" in change) && !("y" in change) ) return;
  const actor = tokenDoc.actor;
  if ( !actor || actor.uuid !== game.user.character?.uuid ) return ui.notifications.warn("Actor not found."); // Review message
  const flag = actor.getFlag("world", "ashardalonsStride");
  const item = actor.items.get(flag?.itemId);
  if ( !item ) return;
  const gridSize = canvas.grid.size;
  const source = tokenDoc.object;
  const destination = {x: change.x ?? source.x, y: change.y ?? source.y};
  const destinationCenter = {x: destination.x + (source.w / 2), y: destination.y + (source.h / 2)};
  const ray = new Ray(source.center, destinationCenter);
  const step = 1 / (ray.distance / gridSize);
  const damageType = flag.damageType;
  const ashardalons_stride = feanor.utils.filterDatabase(feanor.database.ashardalons_stride, damageType);
  const seq = new Sequence({moduleName: "Fëanor", softFail: true});
  seq.sound(ashardalons_stride.sounds.on_cast_$).volume(0.5);
  for ( let i = 0; i < 1.1; i += step ) {
    const coordinates = ray.project(Math.min(i, 1));
    seq.effect()
      .file(ashardalons_stride.effects.trail_$)
      .atLocation(coordinates)
      .belowTokens()
      // .size({}, {gridUnits: true})
      // .scaleToObject(size) // See considerTokenScale new option
      // .scale(.5)
      .scaleToObject(1.5, {uniform: true}) // See considerTokenScale new option
      .randomizeMirrorX()
      // .opacity(0.75)
      // .tint(0x098f2c)
      // .tint(0x5eff00)
      // .filter("ColorMatrix", { hue: 250 })
      .duration(ashardalons_stride.options.trail_duration_$) // High duration cause short effects to repeat
      .fadeIn(250)
      .fadeOut(500)
    .wait(ashardalons_stride.options.trail_interval_$);
  }
  // BUG: .wait() is preventing serialization; when/if fixed, change to .play({remote: true})
  await seq.play();
  const bounds = new PIXI.Rectangle(destination.x, destination.y, source.w, source.h);
  const hitArea = bounds.pad(gridSize / 2);
  let damagedTargets = flag.damagedTargets;
  const targets = canvas.tokens.placeables.filter(t =>
    t.bounds.intersects(hitArea)
    && t !== source
    && !damagedTargets.includes(t.id)
  );
  if ( !targets.length ) return; // Review
  const targetIds = targets.map(t => t.id);
  game.user.updateTokenTargets(targetIds);
  const damageRoll = await feanor.utils.getSpellDamageRoll(item, flag.spellLevel);
  new MidiQOL.DamageOnlyWorkflow(actor, source, damageRoll.total, damageType, targets, damageRoll, {itemCardId: "new", itemData: item});
  damagedTargets = damagedTargets.concat(targetIds);
  await actor.setFlag("world", "ashardalonsStride.damagedTargets", damagedTargets);
}

export const ashardalonsStride = {main, playTrailSequence};
