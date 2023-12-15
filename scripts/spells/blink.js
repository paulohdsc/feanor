/**
 * Blink | 3rd-level Transmutation | PHB pg. 219
 * Modules: Effect Macro, JB2A, Sequencer, Token Magic Fx
 * To do: Use Perfect Vision to restrict vision to 60 ft and create a "shades of gray" effect
 *        Improve teleport logic to account for Large+ tokens
 *        (consider .moveTowards(destination, {relativeToCenter: true}))
 */
export async function blink({trigger, actor, effect, token}) {
  const tokenMagic = game.modules.get("tokenmagic")?.active;
  const macroData = feanor.utils.getClientSettings("feanor.macroData");
  const isEthereal = tokenMagic ? TokenMagic.hasFilterId(token, "spectral-body") : macroData?.blink?.isEthereal;
  const {blink} = feanor.database;
  await feanor.utils.preload(blink);

  // Effect Macro: feanor.spells.blink({trigger: "onTurnEnd", actor, effect, token})
  if ( trigger === "onTurnEnd" ) {
    const roll = new Roll("d20");
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({actor}),
      flavor: `
        <div class="dnd5e chat-card">
          <header class="card-header" style="display:flex">
            <img src=${effect.icon} width="36" height="36">
            <h3>${effect.name} roll</h3>
          </header>
        </div>
      `
    });
    if ( roll.total >= 11 ) playVanishSequence();
    else playFailSequence();
  }

  // Effect Macro: feanor.spells.blink({trigger: "onTurnStart", token}) | Same for the others
  if ( ["onTurnStart", "onEffectDeletion", "onCombatEnding"].includes(trigger) ) {
    if ( !isEthereal ) return;
    playRangeSequence();
    canvas.app.stage.addListener("pointerdown", getDestination);
  }

  // Represent the character vanishing to the Ethereal Plane
  function playVanishSequence() {
    new Sequence({moduleName: "Fëanor", softFail: true})
      .sound()
        .file(blink.sounds.vanish)
      .wait(2000)
      .effect()
        .file(blink.effects.vanish)
        .atLocation(token)
        .size(token.document.width * 2, {gridUnits: true})
      .wait(1000)
      .animation()
        .on(token)
        .opacity(0)
        .playIf(!tokenMagic)
      .thenDo(() => {
        if ( tokenMagic ) TokenMagic.addFilters(token, "spectral-body");
        else feanor.utils.updateClientSettings("feanor.macroData", {blink: {isEthereal: true}});
      })
      .play();
  }

  // Represent the spell failing to vanish the character
  function playFailSequence() {
    new Sequence({moduleName: "Fëanor", softFail: true})
      .sound()
        .file(blink.sounds.vanish)
        .fadeOutAudio(2700, {ease: "easeOutExpo"})
      .wait(2000)
      .sound()
        .file(blink.sounds.fail)
      .effect()
        .file(blink.effects.fail)
        .atLocation(token)
        .belowTokens()
        .scaleToObject(2)
      .play();
  }

  // Represent the range available for the character to appear within
  function playRangeSequence() {
    new Sequence({moduleName: "Fëanor", softFail: true})
      .effect()
        .name("blink-range")
        .file(blink.effects.range)
        .atLocation(token)
        .belowTokens()
        .size(token.document.width + 4, {gridUnits: true})
        .fadeIn(1000)
        .persist()
        .fadeOut(5000)
      // .animation()
      //   .on(token)
      //   .fadeOut(1000)
      .play();
  }

  // Get the appearance destination within the available range
  function getDestination(event) {
    const pos = event.getLocalPosition(canvas.app.stage);
    const [x1, y1] = canvas.grid.getCenter(pos.x, pos.y);
    const [x2, y2] = canvas.grid.getTopLeft(pos.x, pos.y);
    const destCenter = {x: x1, y: y1};
    const destTopLeft = {x: x2, y: y2};
    const distance = canvas.grid.measureDistance(token, destTopLeft, {gridSpaces: true});
    if ( event.button === 0 ) { // Left mouse button
      if ( distance > 10 ) ui.notifications.warn("Choose a space within range or middle-click to return in-place.");
      else playAppearSequence(token, destCenter, destTopLeft, true);
    } else if ( event.button === 1 ) { // Middle mouse button
      playAppearSequence(token, destCenter, destTopLeft, false);
    }
  }

  // Represent the character returning from the Ethereal Plane
  function playAppearSequence(token, destCenter, destTopLeft, teleport) {
    Sequencer.EffectManager.endEffects({name: "blink-range"});
    canvas.app.stage.removeListener("pointerdown", getDestination);
    new Sequence({moduleName: "Fëanor", softFail: true})
      .sound()
        .file(blink.sounds.vanish)
      .wait(1500)
      .effect()
        .file(blink.effects.appear)
        .atLocation(destCenter)
        .size(token.document.width * 2, {gridUnits: true})
      .wait(1200)
      .animation()
        .on(token)
        .teleportTo(destTopLeft)
        .playIf(teleport)
      .animation()
        .on(token)
        .opacity(1)
        .playIf(!tokenMagic)
      .thenDo(() => {
        if ( tokenMagic ) TokenMagic.deleteFilters(token, "spectral-body");
        else feanor.utils.updateClientSettings("feanor.macroData", {"-=blink": null});
      })
      .play();
  }
}
