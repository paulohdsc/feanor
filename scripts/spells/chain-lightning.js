/**
 * Chain Lightning | 6th-Level Evocation | PHB pg. 221
 * Modules: Item Macro, JB2A, Midi Qol ("preambleComplete"), Sequencer
 * Usage: await feanor.spells.chainLightning(args)
 * @param {object} args     Workflow data provided by Midi QoL
 */
export async function chainLightning(args) {
  const {token: source, targets, spellLevel} = feanor.utils.getContext(args);
  const primaryTarget = targets[0].object;
  const maxSecondaryTargets = 3 + (spellLevel - 6);

  // Get potential targets in the current Scene
  // Condition: within 30 ft of the primary target and above 0 HP
  const nearbySecondaryTargets = MidiQOL.findNearby(null, primaryTarget, 30);
  const potentialSecondaryTargets = nearbySecondaryTargets.filter(t => t.actor.system.attributes.hp.value > 0);

  // Get secondary targets between potential targets
  let secondaryTargetsList = null;
  let secondaryTargets = [];
  while ( !secondaryTargetsList || secondaryTargetsList.length > maxSecondaryTargets ) {
    secondaryTargetsList = await chooseTargets(potentialSecondaryTargets, maxSecondaryTargets);
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
  await playSequence(source, primaryTarget, secondaryTargets);

  /**
   * Prompt user to choose between potential targets
   * @param {Token[]} potentialTargets    An array of potential Token targets
   * @param {number} maxTargets           The maximum number of targets allowed
   * @returns {Promise<NodeList>}         A Promise that resolves to the chosen result
   */
  function chooseTargets(potentialTargets, maxTargets) {
    const chosenTargetsList = new Promise((resolve, reject) => {
      const potentialTargetsList = potentialTargets.reduce((acc, cur) => {
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
              <td colspan="2">Choose up to <strong>${maxTargets}</strong> creatures or objects</td>
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
   * @param {Token} source             The Token of the caster
   * @param {Token} primaryTarget           The first target Token, from which the bolts will leap
   * @param {Token[]} secondaryTargets      An array of Token targets, which the bolts will jump to
   */
  async function playSequence(source, primaryTarget, secondaryTargets) {
    // const {audio} = feanor.database;
    // TODO: Update the database and remove this
    const audio = { // from database > const database2 (old)
      channeling: {
        lightning: "upload-player/feanor/chromatic-orb-casting.wav"
      },
      impact: {
        lightning: [
          "upload-player/feanor/shocking-grasp.wav",
          "modules/soundfxlibrary/Combat/Single/Spell%20Impact%20Lightning/spell-impact-lightning-4.mp3"
        ]
      }
    };
    await Sequencer.Preloader.preloadForClients([
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
    const sequence = new Sequence({moduleName: "Fëanor", softFail: true})
      .effect()
        .file("jb2a.static_electricity.01.blue")
        .attachTo(source)
        .scaleToObject(1.5)
        .duration(4000)
        .waitUntilFinished(-3000)
      .sound()
        .file(audio.channeling.lightning)
        .fadeOutAudio(1000)
      .effect()
        .file("jb2a.lightning_ball.blue")
        .attachTo(source)
        .scale(0.3)
        .anchor({x: 0.3})
        .rotateTowards(primaryTarget)
        .fadeIn(500)
        .duration(4000)
        .fadeOut(500)
        .waitUntilFinished(-1000)
      .effect()
        .file("jb2a.static_electricity.03.blue")
        .attachTo(source)
        .scaleToObject(1.5)
        .duration(3000)
      .sound()
        .file(audio.impact.lightning[0])
        .delay(500)
        .fadeOutAudio(2000)
      .effect()
        .file("jb2a.chain_lightning.primary.blue")
        .atLocation(source)
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
    // BUG: .wait() is preventing serialization; when/if fixed, change to .play({remote: true})
    await sequence.play();
  }
}
