(async () => {

  /**
   * Disintegrate
   */
  const target = game.user.targets.first();
  const {audio, image} = feanor.database;

  await Sequencer.Preloader.preloadForClients([
    audio.disintegrate,
    image.pile_of_dust,
    "jb2a.disintegrate.green",
    "jb2a.impact.004.blue"
  ]);

  const sequence = new Sequence({moduleName: "Fëanor Dragorion", softFail: true})
    .sound()
      .file(audio.disintegrate)
    .effect()
      .file("jb2a.disintegrate.green")
      // .attachTo(token)
      // .stretchTo(target, {attachTo: true})
      .atLocation(token)
      .stretchTo(target);
  if ( target.actor.system.attributes.hp.value <= 0 ) {
    sequence
    .wait(1650)
    .effect()
      .file("jb2a.impact.004.blue")
      .atLocation(target)
      .scaleToObject(2)
      .randomRotation()
      .filter("ColorMatrix", {hue: 220})
    .animation()
      .on(target)
      .hide()
      .delay(100)
    .effect()
      .file(image.pile_of_dust)
      .atLocation(target)
      .scaleToObject()
      .filter("ColorMatrix", {contrast: 1, saturate: -1})
      .persist()
      .tieToDocuments(target);
  }
  await sequence.play();

})();
