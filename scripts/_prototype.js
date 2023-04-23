/* eslint-disable jsdoc/require-jsdoc */

await (async () => {
  /**
   * Modules: DAE, Effect Macro, JB2A, Midi QoL ("preItemRoll" and "preDamageRoll"),
   *          Sequencer, SoundFx Library and Times Up
   * Issues: SnowflakeBurst missing in the JB2A database
   * To do: Improve macro with Drag Ruler?
   *        const size = Math.floor(Math.random() * (2 - 1.5 + 1) + 1.5);
   *        Use data.attributes.movement.walk/swin/fly...
   */
  console.log("%cAshardalon's Stride", "color:yellow", args, this);
  let spellLevel;
  let damageType = item.system.damage.parts[0][1];
  let tokenId = token.id;
  let spell = item; // TODO: find better solution
  let ashardalonsStride;
  if ( args[0].macroPass === "preItemRoll" ) {
    if ( args[0].targets.length > 1 || args[0].targets[0].id !== args[0].tokenId ) {
      ui.notifications.warn("You must target only the caster's token.");
      return false;
    }
  }
  if ( args[0].macroPass === "preDamageRoll" ) {
    const {ashardalonsStride: db} = feanor.database;
    ashardalonsStride = {
      effects: {
        magic_circle: db.effects.magic_circle,
        onCast: db.effects.onCast[damageType],
        trail: db.effects.trail[damageType]
      },
      sounds: {
        chant: db.sounds.chant,
        onCast: db.sounds.onCast[damageType]
      },
      trailDelay: db.trailDelay[damageType]
    };
    await feanor.utils.preload(ashardalonsStride);

    spellLevel = args[0].spellLevel;
    playCastingSequence(token);

    // Issue: Optional chaining at event.findSplice (foundry.js: 657)
    Hooks.off("preUpdateToken", playTrailSequence);
    const hookId = Hooks.on("preUpdateToken", playTrailSequence); // Change to ashardalonsTrail?
    Hooks.once(`midi-qol.preDamageRoll.${this.uuid}`, () => false); // OR this.systemCard = true;

    actor.setFlag("world", "ashardalonsStride", {
      damagedTokens: [],
      hookId
    });
    this.next(15); // APPLYDYNAMICEFFECTS

    // Hooks.on(`midi-qol.preApplyDynamicEffects.${this.uuid}`, () => false);
  }

  if ( ["onTurnStart", "onTurnEnd"].includes(args) ) {
    actor.unsetFlag("world", "ashardalonsStride.damagedTokens");
  }
  if ( args === "onEnable") {
    Hooks.off("preUpdateToken", playTrailSequence);
    const hookId = Hooks.on("preUpdateToken", playTrailSequence);
    // actor.unsetFlag("world", "ashardalonsStride.damagedTokens");
    actor.setFlag("world", "ashardalonsStride", {
      damagedTokens: [],
      hookId
    });
  }
  if ( args === "onDelete" ) {
    Hooks.off("preUpdateToken", playTrailSequence);
    actor.unsetFlag("world", "ashardalonsStride");
  }

  // See .playIf(boolean) or .playIf(inFunction)
  // See .filter(string, object)
  // See .tint() or .tint(hexadecimal) or .tint(decimal)
  // See .addOverride(async (effect, data) => {/*do stuf*/; return data;})
  function playCastingSequence(token) {
    new Sequence({moduleName: "Fëanor", softFail: true})
      .sound()
        .file(ashardalonsStride.sounds.chant)
      .effect()
        .file(ashardalonsStride.effects.magic_circle)
        .atLocation(token, {cacheLocation: true})
        .belowTokens()
        .size(token.document.width + 2, {gridUnits: true})
        .animateProperty("sprite", "rotation", {from: 0, to: 180, duration: 2000, ease: "easeInOutCubic"})
      .wait(4000)
      .sound()
        .file(ashardalonsStride.sounds.onCast)
      .effect()
        .file(ashardalonsStride.effects.onCast)
        .atLocation(token)
        .attachTo(token)
        .belowTokens()
        .size(token.document.width + 1, {gridUnits: true})
        .fadeIn(500)
        .fadeOut(500)
      .play();
  }

  async function playTrailSequence(tokenDoc, change) {
    if ( tokenDoc.id !== tokenId ) return;
    if ( !("x" in change) && !("y" in change) ) return;
    const gridSize = canvas.grid.size;
    const token = tokenDoc.object;
    const destination = {
      x: change.x ?? token.x,
      y: change.y ?? token.y
    };
    const destinationCenter = {x: destination.x + (token.w / 2), y: destination.y + (token.h / 2)};
    const ray = new Ray(token.center, destinationCenter);
    const step = 1 / (ray.distance / gridSize);

    const seq = new Sequence({moduleName: "Fëanor", softFail: true})
      .sound().file(ashardalonsStride.sounds.onCast).volume(0.5);
    for ( let i = 0; i < 1.1; i += step ) {
      const coordinates = ray.project(Math.min(i, 1));
      seq.effect()
        .file(ashardalonsStride.effects.trail)
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
    await seq.play();

    const bounds = new PIXI.Rectangle(destination.x, destination.y, token.w, token.h);
    const hitArea = bounds.pad(gridSize / 2);
    let damagedTokens = tokenDoc.actor.getFlag("world", "ashardalonsStride.damagedTokens") ?? [];
    const targetTokens = canvas.tokens.placeables.filter(t =>
      t.bounds.intersects(hitArea)
      && t !== token
      && !damagedTokens.includes(t.id)).map(t => t.id);
    game.user.updateTokenTargets(targetTokens);
    if ( targetTokens.length ) spell.rollDamage({spellLevel}); // How to prevent active effect transferral?
    damagedTokens = damagedTokens.concat(targetTokens);
    console.log(damagedTokens);
    await tokenDoc.actor.setFlag("world", "ashardalonsStride", {damagedTokens});
    // new MidiQOL.DamageOnlyWorkflow(actor, token.document, damageRoll.total,
    // "force", [targets], damageRoll, {itemCardId: "new", itemData: item.data});
  }

})();

/* Hypnotic Pattern
new Sequence({moduleName: "Fëanor", softFail: true})
  .effect()
    .file("upload-player/feanor/hypnotic-pattern.webp")
    .atLocation({x: 1000, y: 1500})
    .scale(0.25)
    // .filter("Glow", {distance: 1})
    // .filter("Blur", {strength: 2})
    // .loopProperty("sprite", "position.x", { from: -200, to: 200, duration: 500})
    .persist()
  .play();
 */

/* Web Spell
actor.rollAbilityTest("str", {targetValue: 18})
 */
