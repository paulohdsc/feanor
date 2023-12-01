/**
 * Blink | 3rd-level Transmutation | PHB pg. 219
 * Modules: DAE, Item Macro, JB2A, Midi QoL, Sequencer, Token Magic Fx
 *
 * Usage: Run as ItemMacro via Midi's On Use Macro on the item sheet
 * To do: Use Perfect Vision to restrict vision to 60 ft. and create a "shades of gray" effect
 *        Improve teleport to account for Large+ tokens
 */
export async function blink({trigger, actor, effect, token}) {
  const tokenMagicFx = game.modules.get("tokenmagic").active;
  const soundFile = "modules/feanor/audios/misty-step.wav";
  const videoFiles = {
    vanish: "jb2a.misty_step.01.blue",
    appear: "jb2a.misty_step.02.blue",
    range: "jb2a.extras.tmfx.border.circle.simple.01"
  };
  await Sequencer.Preloader.preloadForClients([soundFile, ...Object.values(videoFiles)]);

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
    if ( roll.total >= 11 ) vanish();
  }

  if ( ["onTurnStart", "onEffectDeletion", "onCombatEnding"].includes(trigger) ) {
    const inEtherealPlane = tokenMagicFx
      ? TokenMagic.hasFilterId(token, "spectral-body")
      : actor.getFlag("world", "inEtherealPlane");
    if ( inEtherealPlane ) {
      // Todo: enhance this wait logic
      while ( token.document.alpha < 1 ) {
        ui.notifications.info("Waiting for the vanish function to finish.");
        await Sequencer.Helpers.wait(3000);
      }
      getDestination();
    }
  }

  // Play animation to represent the character vanishing to the Ethereal Plane
  function vanish() {
    new Sequence({moduleName: "Fëanor", softFail: true})
      .sound()
        .file(soundFile)
      .wait(2000)
      .effect()
        .file(videoFiles.vanish)
        .atLocation(token)
        .size(token.document.width * 2, {gridUnits: true})
        .randomRotation()
      .wait(1000)
      .animation()
        .on(token)
        .opacity(0)
      .thenDo(() => {
        if ( tokenMagicFx ) TokenMagic.addFilters(token, "spectral-body");
        else actor.setFlag("world", "inEtherealPlane", true); // setFlag before animation?
      })
      .wait(10000)
      .animation()
        .on(token)
        .fadeIn(5000)
      .play();
  }

  function getDestination() {
    new Sequence({moduleName: "Fëanor", softFail: true})
      .animation()
        .on(token)
        .fadeOut(2000)
      .effect()
        .file(videoFiles.range)
        .size(token.document.width + 4.3, {gridUnits: true})
        .atLocation(token)
        .belowTokens()
        .fadeIn(2000)
        .fadeOut(2000)
        .persist(true)
        .name("range-template")
      .wait(2000)
      .thenDo(() => {
        if ( tokenMagicFx ) TokenMagic.deleteFilters(token); // Todo: delete only blink filter
        else actor.setFlag("world", "inEtherealPlane", false);
      })
      .play();

    canvas.app.stage.addListener("pointerdown", event => {
      const token = game.user.character.getActiveTokens()[0];
      if ( !token ) return ui.notifications.error("No token found.");
      const position = event.data.getLocalPosition(canvas.app.stage);
      const topLeft = canvas.grid.getTopLeft(position.x, position.y);
      const fakeToken = {
        document: {x: topLeft[0], y: topLeft[1], width: 1, height: 1, elevation: token.document.elevation}
      };
      const distance = MidiQOL.computeDistance(token, fakeToken);
      if ( event.data.button === 0 ) { // Left click
        if ( distance > 10 ) {
          return ui.notifications.error("The selected spot is out of range. Choose again or middle click to cancel.");
        }
        Sequencer.EffectManager.endEffects({name: "range-template"});
        canvas.app.stage.removeListener("pointerdown");
        appear(token, topLeft);
      } else if ( event.data.button === 1 ) { // Middle click
        Sequencer.EffectManager.endEffects({name: "range-template"});
        canvas.app.stage.removeListener("pointerdown");
        appear(token);
      }
    });
  }

  // Play animation to represent the character returning from the Ethereal Plane
  // Teleport animation relative to the top left corner of the token
  function appear(token, destination=[]) {
    new Sequence()
      .sound()
        .file(soundFile)
      .animation()
        .on(token)
        .teleportTo({x: destination[0], y: destination[1]})
        .playIf(destination.length)
      .wait(1500)
      .effect()
        .file(videoFiles.appear)
        .atLocation(token)
        .size(token.document.width * 2, {gridUnits: true})
        .randomRotation()
      .wait(1500)
      .animation()
        .on(token)
        .opacity(1)
      .play();
  }
}
