/* eslint-disable jsdoc/require-jsdoc, jsdoc/require-param, quote-props */

/**
 * Summon Draconic Spirit | 5th-Level Conjuration | FTD pg. 21
 * Modules: D&D5e Animations, JB2A, Midi QoL, Sequencer, Warp Gate
 * TODO: Dialog to choose Breath Weapon's damage type and A-A animation (check for JB2A Patreon activation)
 */
async function main({actor: casterActor, token: casterToken, item: spell, args}) {
  const dsName = "Draconic Spirit";
  const dsFamilies = ["chromatic", "gem", "metallic"];
  const dsResistances = {
    chromatic: ["acid", "cold", "fire", "lightning", "poison"],
    gem: ["force", "necrotic", "psychic", "radiant", "thunder"],
    metallic: ["acid", "cold", "fire", "lightning", "poison"]
  };
  const options = {controllingActor: casterActor, crosshairs: {rememberControlled: true}};
  const {macroPass, spellLevel} = args[0];
  let selected;

  if ( macroPass === "preTargeting" ) {
    if ( !game.actors.getName(dsName) ) {
      ui.notifications.warn(`Could not find world actor named "${dsName}".`);
      return false;
    }
    const spellIsActive = casterActor.effects.some(e => e.origin === spell.uuid);
    if ( !spellIsActive ) return;
    const macroData = feanor.utils.getClientSettings("feanor.macroData");
    const dsTokenUuid = macroData?.summonDraconicSpirit?.dsTokenUuid;
    const dsTokenDoc = fromUuidSync(dsTokenUuid ?? "");
    // If the draconic spirit is in another scene, spawn it again using the previous token data
    if ( dsTokenDoc && !dsTokenDoc.object ) {
      // Midi v10 bug: token is undefined on "preTargeting" on a new scene; remove this line on v11
      const [casterToken] = casterActor.getActiveTokens();
      const tokenIds = await warpgate.spawn(dsTokenDoc, {}, {}, options);
      if ( !tokenIds?.length ) return;
      const dsNewToken = canvas.tokens.get(tokenIds[0]);
      feanor.utils.updateClientSettings("feanor.macroData", {summonDraconicSpirit: {dsTokenUuid: dsNewToken.document.uuid}});
      createCombatant(casterToken, dsNewToken);
      return false;
    }
  }

  if ( macroPass === "preActiveEffects" ) {
    selected = await createDialog();
    const updates = createSpawnUpdates(selected.family);
    Hooks.off("updateActor", dismissDraconicSpirit);
    Hooks.off("deleteActiveEffect", dismissDraconicSpirit);
    Hooks.once("preCreateActiveEffect", updateCasterResistance);
    warpgate.spawn(dsName, updates, {pre: playSummonSequence, post: runPostSummonActions}, options);
  }

  // Prompts the user to choose a dragon family and a shared resistance
  function createDialog() {
    return new Promise((resolve, reject) => {
      const dialog = new Dialog({
        title: "Summon Draconic Spirit: Usage Configuration",
        content: createDialogContent(),
        buttons: {
          confirm: {
            icon: '<i class="fa-solid fa-check"></i>',
            label: "Confirm",
            callback: html => {
              const family = html.querySelector("select#family").value;
              const resistance = html.querySelector("select#resistance").value;
              resolve({family, resistance});
            }
          }
        },
        default: "confirm",
        render: html => html.querySelector("select#family").addEventListener("change", event => {
          const family = event.target.value;
          dialog.data.content = createDialogContent(family);
          dialog.render();
        }),
        close: () => reject(new Error("The Dialog was closed without a choice being made."))
      }, {jQuery: false, width: 400}).render(true);
    });
  }

  // Creates the dialog content based on the current selected dragon family
  function createDialogContent(family="chromatic") {
    const familyOptions = dsFamilies.reduce((acc, cur) => {
      const isSelected = cur === family ? " selected" : "";
      return acc += `<option value="${cur}"${isSelected}>${cur.charAt(0).toUpperCase() + cur.slice(1)}</option>`;
    }, "");
    const resistanceOptions = dsResistances[family].reduce((acc, cur) => {
      return acc += `<option value="${cur}">${cur.charAt(0).toUpperCase() + cur.slice(1)}</option>`;
    }, "");
    return `
      <form>
        <div class="form-group">
          <label>Choose a dragon family:</label>
          <select id="family" style="flex:2;text-align:center" autofocus>${familyOptions}</select>
        </div>
        <div class="form-group">
          <label>Choose a shared resistance:</label>
          <select id="resistance" style="flex:2;text-align:center">${resistanceOptions}</select>
        </div>
      </form>
    `;
  }

  // Get the update data to be used by Warpgate's spawn process
  function createSpawnUpdates(family) {
    const casterSpellAbility = casterActor.system.attributes.spellcasting;
    const casterSpellMod = casterActor.system.abilities[casterSpellAbility]?.mod ?? 0;
    const casterSpellAttackBonus = casterActor.system.bonuses.msak.attack;
    const casterSpellSaveDC = casterActor.system.attributes.spelldc;
    const casterProficiency = casterActor.system.attributes.prof;
    const dsAC = `@attributes.ac.armor + 2 + @attributes.ac.dex + ${spellLevel}`;
    const dsHP = 50 + ((spellLevel - 5) * 10);
    const dsCR = Math.max((((casterProficiency - 2) * 4) + 1), 0);
    const dsRendAttacks = Math.floor(spellLevel / 2);
    const dsRendDamage = `1d6 + 4 + ${spellLevel}`;
    return {
      actor: {
        system: {
          attributes: {
            ac: {formula: dsAC},
            hp: {value: dsHP, max: dsHP}
          },
          details: {
            cr: dsCR,
            type: {subtype: `${family}`}
          },
          traits: {
            dr: {custom: "", value: dsResistances[family]}
          }
        }
      },
      token: {
        elevation: casterToken?.document?.elevation ?? 0,
        rotation: casterToken?.document?.rotation ?? 0
      },
      embedded: {
        Item: {
          "Breath Weapon": {
            system: {
              save: {dc: casterSpellSaveDC}
            }
          },
          "Multiattack": {
            system: {
              description: {value: `The dragon makes ${dsRendAttacks} Rend attacks and uses its Breath Weapon.`}
            }
          },
          "Rend": {
            system: {
              attackBonus: `${casterSpellMod} + ${casterSpellAttackBonus}`,
              damage: {parts: [[dsRendDamage, "piercing"]]}
            }
          }
        }
      }
    };
  }

  // Update damage resistance of the caster's Shared Resistance Active Effect
  function updateCasterResistance(document) {
    if ( document.origin !== spell.uuid ) return;
    document.updateSource({changes: [{key: "system.traits.dr.value", mode: 0, value: selected.resistance, priority: 20}]});
  }

  // Play sound and visual effects for the draconic spirit summoning
  async function playSummonSequence(location) {
    const summon_draconic_spirit = feanor.utils.filterDatabase(feanor.database.summon_draconic_spirit);
    await feanor.utils.preload(summon_draconic_spirit);
    await new Sequence({moduleName: "Fëanor", softFail: true})
      .sound()
        .file(summon_draconic_spirit.sounds.chant)
        .duration(5700)
        .fadeOutAudio(1000)
      .effect()
        .file(summon_draconic_spirit.effects.magic_circle)
        .atLocation(location)
        .belowTokens()
        .size(4, {gridUnits: true})
        .animateProperty("sprite", "rotation", {from: 0, to: 180, duration: 2000, ease: "easeInOutCubic"})
        .filter("ColorMatrix", {hue: 200}) // Use JB2A Patreon and remove filter?
      .wait(3800)
      .effect()
        .file(summon_draconic_spirit.effects.rune)
        .atLocation(location)
        .size(8, {gridUnits: true})
      .wait(1800)
      .sound()
        .file(summon_draconic_spirit.sounds.summon)
      .effect()
        .file(summon_draconic_spirit.effects.impact)
        .atLocation(location)
        .belowTokens()
        .size(4, {gridUnits: true})
      // BUG: .wait() is preventing serialization; when/if fixed, change to .play({remote: true})
      .play();
  }

  // Actions to be taken after the draconic spirit is summoned
  function runPostSummonActions(_location, dsTokenDoc) {
    Hooks.on("updateActor", dismissDraconicSpirit);
    Hooks.on("deleteActiveEffect", dismissDraconicSpirit);
    feanor.utils.updateClientSettings("feanor.macroData", {
      activeHooks: {
        summonDraconicSpirit: {
          updateActor: {
            fn: "feanor.spells.summonDraconicSpirit.dismissDraconicSpirit",
            once: false
          },
          deleteActiveEffect: {
            fn: "feanor.spells.summonDraconicSpirit.dismissDraconicSpirit",
            once: false
          }
        }
      },
      summonDraconicSpirit: {
        spellUuid: spell.uuid,
        dsTokenUuid: dsTokenDoc.uuid
      }
    });
    createCombatant(casterToken, dsTokenDoc.object);
  }

  // Create a combatant for the draconic spirit and make its initiative match the caster's
  function createCombatant(casterToken, dsToken) {
    // Waiting bug fix: https://github.com/foundryvtt/dnd5e/issues/2468
    // const casterInitiative = casterToken?.combatant?.initiative;
    // if ( casterInitiative != null ) return;
    // Hooks.once("dnd5e.preRollInitiative", (actor, roll) => {
    //   if ( actor.uuid !== dsToken.actor?.uuid ) return;
    //   const mod = game.settings.get("dnd5e", "initiativeDexTiebreaker") ? -0.01 : -1;
    //   roll._formula = (casterInitiative + mod).toString(); // Need testing
    // });

    const casterInitiative = casterToken?.combatant?.initiative;
    if ( casterInitiative == null ) return; // undefined == null
    Hooks.once("preUpdateCombatant", (combatant, change) => {
      if ( combatant.tokenId !== dsToken.id ) return;
      const mod = game.settings.get("dnd5e", "initiativeDexTiebreaker") ? -0.01 : -1;
      change.initiative = casterInitiative + mod;
    });

    // Waiting bug fix: https://github.com/foundryvtt/foundryvtt/issues/9992
    // Add formula; remove messageOptions; remove Hooks
    // const formula = casterToken.combatant.initiative.toString() || null; // Need testing; check combatant
    dsToken.actor.rollInitiative({
      createCombatants: true,
      // initiativeOptions: {formula}
      initiativeOptions: {messageOptions: {rollMode: "gmroll"}}
    });
  }
}

// Actions to be taken when the draconic spirit is to be dismissed
async function dismissDraconicSpirit(document, data) {
  const macroData = feanor.utils.getClientSettings("feanor.macroData");
  const dsTokenUuid = macroData?.summonDraconicSpirit?.dsTokenUuid;
  const spellUuid = macroData?.summonDraconicSpirit?.spellUuid;
  if ( document.uuid !== dsTokenUuid && document.origin !== spellUuid ) return;
  if ( document.documentName === "Actor" ) {
    const hp = foundry.utils.getProperty(data, "system.attributes.hp.value");
    if ( hp !== 0 ) return;
  }
  Hooks.off("updateActor", dismissDraconicSpirit);
  Hooks.off("deleteActiveEffect", dismissDraconicSpirit);
  feanor.utils.updateClientSettings("feanor.macroData", {
    "activeHooks.-=summonDraconicSpirit": null,
    "-=summonDraconicSpirit": null
  });
  if ( document.documentName === "Actor" ) {
    const casterActor = fromUuidSync(document.flags.warpgate?.control?.actor ?? "");
    if ( casterActor ) MidiQOL.getConcentrationEffect(casterActor)?.delete();
  }
  const dsToken = fromUuidSync(dsTokenUuid)?.object;
  if ( dsToken ) {
    await playDismissSequence(dsToken);
    warpgate.dismiss(dsToken.id);
  }
}

// Play sound and visual effects for the draconic spirit dismissal
async function playDismissSequence(dsToken) {
  const summon_draconic_spirit = feanor.utils.filterDatabase(feanor.database.summon_draconic_spirit);
  await feanor.utils.preload(summon_draconic_spirit);
  await new Sequence({moduleName: "Fëanor", softFail: true})
    .sound()
      .file(summon_draconic_spirit.sounds.dismiss)
    .wait(1500)
    .effect()
      .file(summon_draconic_spirit.effects.rune)
      .atLocation(dsToken, {cacheLocation: true})
      .size(8, {gridUnits: true})
    .wait(1800)
    .play();
}

export const summonDraconicSpirit = {main, dismissDraconicSpirit};
