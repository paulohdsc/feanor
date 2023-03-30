// MIT License (c) 2022 Paulo Henrique (PH#2526)

const spells = {

  /* ------------------------------------------- */
  /*  6th Level                                  */
  /* ------------------------------------------- */

  /**
   * Usage: await feanor.spells.chainLightning(args)
   * Requires: Item Macro, JB2A, Midi Qol ("preambleComplete"), Sequencer
   * @param {object} args     Workflow information provided by Midi Qol
   */
  async chainLightning(args) {
    const {token: sourceToken, targets, spellLevel} = feanor.utils.getContext(args);
    const primaryTarget = targets[0].object;
    const maxSecondaryTargets = 3 + (spellLevel - 6);
    const {audio} = feanor.database;
    Sequencer.Preloader.preloadForClients([
      audio.channeling.lightning,
      audio.impact.lightning[0],
      audio.impact.lightning[1],
      "jb2a.chain_lightning.primary.blue",
      "jb2a.chain_lightning.secondary.blue",
      "jb2a.lightning_ball.blue",
      "jb2a.static_electricity.01.blue",
      "jb2a.static_electricity.02.blue",
      "jb2a.static_electricity.03.blue"
    ]);

    // Get potential targets in the current Scene
    // Condition: within 30 ft of the primary target and above 0 HP
    const nearbySecondaryTargets = MidiQOL.findNearby(null, primaryTarget, 30);
    const potentialSecondaryTargets = nearbySecondaryTargets.filter(t => t.actor.system.attributes.hp.value > 0);

    // Get secondary targets between potential targets
    let secondaryTargetsList = null;
    let secondaryTargets = [];
    while ( !secondaryTargetsList || secondaryTargetsList.length > maxSecondaryTargets ) {
      secondaryTargetsList = await chooseTargets(potentialSecondaryTargets);
      if ( secondaryTargetsList.length > maxSecondaryTargets ) {
        ui.notifications.warn(`You must target at most ${maxSecondaryTargets} tokens.`);
        game.user.updateTokenTargets([primaryTarget.id]);
      }
    }
    for ( const input of secondaryTargetsList ) {
      const token = canvas.tokens.get(input.name);
      secondaryTargets.push(token);
    }

    // Play sound and visual effects for the spell
    await playSequence(sourceToken, primaryTarget, secondaryTargets);

    /**
     * Prompt user to choose between potential targets
     * @param {Token[]} targets         An array of potential Token targets
     * @returns {Promise<NodeList>}     A Promise that resolves to the chosen result
     */
    function chooseTargets(targets) {
      const chosenTargetsList = new Promise((resolve, reject) => {
        const potentialTargetsList = targets.reduce((acc, cur) => {
          return acc += `
            <tr class="potentialTarget" id="${cur.id}">
              <td>
                <img src="${cur.document.texture.src}" style="height:62px;border-style:none">
                <br>${cur.name}
              </td>
              <td style="height:90px">
                <label style="display:flex;min-height:100%;align-items:center;justify-content:center">
                  <input type="checkbox" name="${cur.id}">
                </label>
              </td>
            </tr>
          `;
        }, "");
        const content = `
          <table style="text-align:center">
            <thead>
              <tr>
                <td colspan="2">Choose up to <strong>${maxSecondaryTargets}</strong> creatures or objects</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th width="50%">Target</th>
                <th>Choose</th>
              </tr>
              ${potentialTargetsList}
            </tbody>
          </table>
        `;
        new Dialog({
          title: "Chain Lightning: Usage Configuration",
          content,
          buttons: {
            confirm: {
              icon: '<i class="fa fa-check"></i>',
              label: "Confirm",
              callback: html => resolve(html.querySelectorAll('input[type="checkbox"]:checked'))
            }
          },
          render: html => {
            html.querySelectorAll(".potentialTarget").forEach(element => {
              element.addEventListener("mouseenter", event => {
                const token = canvas.tokens.get(element.id);
                token._onHoverIn(event);
              });
            });
            html.querySelectorAll(".potentialTarget").forEach(element => {
              element.addEventListener("mouseleave", event => {
                const token = canvas.tokens.get(element.id);
                token._onHoverOut(event);
              });
            });
            html.querySelectorAll("input").forEach(element => {
              element.addEventListener("change", event => {
                const token = canvas.tokens.get(element.name);
                token.setTarget(event.target.checked, {releaseOthers: false});
              });
            });
          },
          default: "confirm",
          close: () => reject(new Error("The Dialog was closed without a choice being made."))
        }, {jQuery: false, top: 50, left: 110, width: 300}).render(true);
      });
      return chosenTargetsList;
    }

    /**
     * Play sound and visual effects for the spell
     * @param {Token} sourceToken             The Token of the caster
     * @param {Token} primaryTarget           The first target Token, from which the bolts will leap
     * @param {Token[]} secondaryTargets      An array of Token targets, which the bolts will jump to
     */
    async function playSequence(sourceToken, primaryTarget, secondaryTargets) {
      const sequence = new Sequence({moduleName: "Fëanor Dragorion", softFail: true})
        .effect()
          .file("jb2a.static_electricity.01.blue")
          .attachTo(sourceToken)
          .scaleToObject(1.5)
          .duration(4000)
          .waitUntilFinished(-3000)
        .sound()
          .file(audio.channeling.lightning)
          .fadeOutAudio(1000)
        .effect()
          .file("jb2a.lightning_ball.blue")
          .attachTo(sourceToken)
          .scale(0.3)
          .anchor({x: 0.3})
          .rotateTowards(primaryTarget)
          .fadeIn(500)
          .duration(4000)
          .fadeOut(500)
          .waitUntilFinished(-1000)
        .effect()
          .file("jb2a.static_electricity.03.blue")
          .attachTo(sourceToken)
          .scaleToObject(1.5)
          .duration(3000)
        .sound()
          .file(audio.impact.lightning[0])
          .delay(500)
          .fadeOutAudio(2000)
        .effect()
          .file("jb2a.chain_lightning.primary.blue")
          .atLocation(sourceToken)
          .stretchTo(primaryTarget)
          .waitUntilFinished(-1000)
        .effect()
          .file("jb2a.static_electricity.02.blue")
          .atLocation(primaryTarget)
          .scaleToObject(1.2)
          .delay(700);
      for ( const secondaryTarget of secondaryTargets ) {
        sequence
          .sound()
            .file(audio.impact.lightning[1])
          .effect()
            .file("jb2a.chain_lightning.secondary.blue")
            .atLocation(primaryTarget)
            .stretchTo(secondaryTarget)
          .effect()
            .file("jb2a.static_electricity.02.blue")
            .atLocation(secondaryTarget)
            .scaleToObject(1.2)
            .delay(1200)
          .wait(250);
      }
      await sequence.play();
    }
  }

};

export default spells;
