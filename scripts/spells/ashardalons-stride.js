/* eslint-disable jsdoc/require-jsdoc */

// let ashardalons_stride; // Cache database for playTrailSequence

/**
 * Ashardalon's Stride | 3rd-level transmutation | FTD pg. 19
 * @param {object} [midiHelpers]        Helper variables provided by Midi QoL
 * @param {Actor} [midiHelpers.actor]   The owner of the item
 * @param {Token} [midiHelpers.token]   The actor's token on the scene
 * @param {Item} [midiHelpers.item]     The item itself
 * @param {object} [midiHelpers.args]   Workflow data provided by Midi QoL
 */
export function main({actor, token, item, args}) {
  /**
   * ___UNFINISHED MACRO___
   * Ashardalon's Stride | 3rd-level transmutation | FTD pg. 19
   * Modules: DAE, Effect Macro, JB2A, Midi QoL ("preItemRoll" and "preDamageRoll"),
   *          Sequencer, SoundFx Library and Times Up
   * Issues: SnowflakeBurst missing in the JB2A database
   *         Insert optional chaining: event?.findSplice (foundry.js: 657)
   * To do: Improve macro with Drag Ruler?
   *        const size = Math.floor(Math.random() * (2 - 1.5 + 1) + 1.5);
   *        Use data.attributes.movement.walk/swin/fly...
   *        DAE v10.0.27: change args[0] to args.name
   */

  console.log("%cAshardalon's Stride", "color:yellow", actor, token, item, args, this);
  if ( args[0].macroPass === "preItemRoll" ) {
    if ( args[0].targets.length > 1 || args[0].targets[0].id !== args[0].tokenId ) {
      ui.notifications.warn("You must target only the caster's token.");
      return false;
    }
  }
  if ( args[0].macroPass === "preDamageRoll" ) {
    const damageType = item.system.damage.parts[0][1];
    Hooks.once(`midi-qol.preDamageRoll.${this.uuid}`, () => false); // OR this.systemCard = true;
    // Hooks.events.preUpdateToken.find(h => h.fn.name === "playTrailSequence")?.id
    // Hooks.off("preUpdateToken", feanor.utils._draft.playTrailSequence);
    // Hooks.off("preUpdateToken", playTrailSequence); // See scope
    Hooks.on("preUpdateToken", playTrailSequence);
    actor.setFlag("world", "ashardalonsStride", {
      damageType,
      damagedTokens: [],
      events: [
        {
          fn: "playTrailSequence", // Change to fnPath
          hook: "preUpdateToken",
          once: false
        }
      ],
      spellLevel: args[0].spellLevel
    });
    this.next(15); // APPLYDYNAMICEFFECTS
    // Hooks.on(`midi-qol.preApplyDynamicEffects.${this.uuid}`, () => false);
    playCastingSequence(token, damageType);
  }
  // if ( ["onTurnStart", "onTurnEnd"].includes(args) ) {
  //   actor.unsetFlag("world", "ashardalonsStride.damagedTokens");
  // }
  // if ( args === "onEnable") {
  //   Hooks.off("preUpdateToken", feanor.utils._draft.playTrailSequence);
  //   const hookId = Hooks.on("preUpdateToken", playTrailSequence);
  //   // actor.unsetFlag("world", "ashardalonsStride.damagedTokens");
  //   actor.setFlag("world", "ashardalonsStride", {
  //     damagedTokens: [],
  //     hookId
  //   });
  // }
  // if ( args === "onDelete" ) {
  //   Hooks.off("preUpdateToken", feanor.utils._draft.playTrailSequence);
  //   actor.unsetFlag("world", "ashardalonsStride");
  // }
}

function getDatabase(damageType) {
  let {ashardalons_stride} = feanor.database;
  return ashardalons_stride = {
    effects: {
      magic_circle: ashardalons_stride.effects.magic_circle,
      on_cast: ashardalons_stride.effects.on_cast[damageType],
      trail: ashardalons_stride.effects.trail[damageType]
    },
    sounds: {
      chant: ashardalons_stride.sounds.chant,
      on_cast: ashardalons_stride.sounds.on_cast[damageType]
    },
    trail_delay: ashardalons_stride.trail_delay[damageType]
  };
}

// See .playIf(boolean) or .playIf(inFunction)
// See .filter(string, object)
// See .tint() or .tint(hexadecimal) or .tint(decimal)
// See .addOverride(async (effect, data) => {/*do stuf*/; return data;})
async function playCastingSequence(source, damageType) {
  // ({ashardalons_stride} = feanor.database);
  // ashardalons_stride = {
  //   effects: {
  //     magic_circle: ashardalons_stride.effects.magic_circle,
  //     on_cast: ashardalons_stride.effects.on_cast[damageType],
  //     trail: ashardalons_stride.effects.trail[damageType]
  //   },
  //   sounds: {
  //     chant: ashardalons_stride.sounds.chant,
  //     on_cast: ashardalons_stride.sounds.on_cast[damageType]
  //   },
  //   trail_delay: ashardalons_stride.trail_delay[damageType]
  // };
  const ashardalons_stride = getDatabase(damageType);
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
      .file(ashardalons_stride.sounds.on_cast)
    .effect()
      .file(ashardalons_stride.effects.on_cast)
      .atLocation(source)
      .attachTo(source)
      .belowTokens()
      .size(source.document.width + 1, {gridUnits: true})
      .fadeIn(500)
      .fadeOut(500)
    // Issue: .wait() is preventing serialization; when/if fixed, change to .play({remote: true})
    .play();
}

async function playTrailSequence(tokenDoc, change) {
  const actorId = game.settings.get("feanor", "actorId");
  const actor = game.actors.get(actorId);
  const item = actor.items.getName("Ashardalon's Stride"); // TO CORRET NAME
  const damageType = actor.getFlag("world", "ashardalonsStride.damageType") ?? "fire";
  const ashardalons_stride = getDatabase(damageType);
  // if ( tokenDoc.id !== token.id ) return;
  if ( tokenDoc.actorId !== actor.id ) return;
  if ( !("x" in change) && !("y" in change) ) return;
  const gridSize = canvas.grid.size;
  const source = tokenDoc.object;
  const destination = {
    x: change.x ?? source.x,
    y: change.y ?? source.y
  };
  const destinationCenter = {x: destination.x + (source.w / 2), y: destination.y + (source.h / 2)};
  const ray = new Ray(source.center, destinationCenter);
  const step = 1 / (ray.distance / gridSize);
  const seq = new Sequence({moduleName: "Fëanor", softFail: true})
    .sound().file(ashardalons_stride.sounds.on_cast).volume(0.5);
  for ( let i = 0; i < 1.1; i += step ) {
    const coordinates = ray.project(Math.min(i, 1));
    seq.effect()
      .file(ashardalons_stride.effects.trail)
      .atLocation(coordinates)
      .belowTokens()
      // .size({}, {gridUnits: true})
      // .scaleToObject(size) // See considerTokenScale new option
      // .scale(.5)
      .scaleToObject(1.5, { uniform: true }) // See considerTokenScale new option
      .randomizeMirrorX()
      // .opacity(0.75)
      // .tint(0x098f2c)
      // .tint(0x5eff00)
      // .filter("ColorMatrix", { hue: 250 })
      .duration(2000)
      .fadeIn(250)
      .fadeOut(500)
    .wait(115); // fire|cold: 60 ms; thunder: 115 ms
  }
  // Issue: .wait() is preventing serialization; when/if fixed, change to .play({remote: true})
  await seq.play();
  const bounds = new PIXI.Rectangle(destination.x, destination.y, source.w, source.h);
  const hitArea = bounds.pad(gridSize / 2);
  let damagedTokens = actor.getFlag("world", "ashardalonsStride.damagedTokens") ?? [];
  const targetTokens = canvas.tokens.placeables.filter(t =>
    t.bounds.intersects(hitArea)
    && t !== source
    && !damagedTokens.includes(t.id)).map(t => t.id);
  game.user.updateTokenTargets(targetTokens);
  // Create new workflow for item.rollDamage() to work on reload
  if ( targetTokens.length ) item.rollDamage({spellLevel: actor.getFlag("world", "ashardalonsStride.spellLevel") ?? 3}); // How to prevent active effect transferral?
  damagedTokens = damagedTokens.concat(targetTokens);
  console.log(damagedTokens);
  await tokenDoc.actor.setFlag("world", "ashardalonsStride", {damagedTokens});
  // new MidiQOL.DamageOnlyWorkflow(actor, source.document, damageRoll.total,
  // "force", [targets], damageRoll, {itemCardId: "new", itemData: item.data});
}

export const ashardalonsStride = {main, playTrailSequence}; // Change to "export function' when finished
