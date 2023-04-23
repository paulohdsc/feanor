const features = {

  // Modules: Midi QoL ("preItemRoll")
  // OnUse Macro: function.return feanor.features.flexibleCasting
  // Update code to use 'this.options.configureDialog = false'
  flexibleCasting({actor, item}) {
    const sorceryPoints = actor.items.getName("Sorcery Points");
    if ( !sorceryPoints ) {
      ui.notifications.warn("Sorcery Points feature not found.");
      return false;
    }
    const sorceryPointsAvailable = sorceryPoints.system.uses.value || 0;
    const sorceryPointsMaximum = sorceryPoints.system.uses.max || 0;
    const spellLevelsAvailable = Object.entries(actor.system.spells).filter(e => e[1].max > 0).map(e => e[0]);
    const options = spellLevelsAvailable.reduce((acc, cur) => {
      return acc += `<option value="${cur.slice(-1)}">${CONFIG.DND5E.spellLevels[cur.slice(-1)]}</option>`;
    }, "");
    const content = `
      <form>
        <div style="margin-bottom:5px">
          <label>You can create spell slots no higher in level than 5th.</label>
        </div>
        <div class="form-group" style="text-align:center">
          <label>Spell Slot:</label>
          <select style="text-align:center" autofocus>${options}</select>
        </div>
      </form>
    `;

    new Dialog({
      title: "Flexible Casting: Usage Configuration",
      content,
      buttons: {
        expend: {
          icon: '<i class="fa-solid fa-arrow-down"></i>',
          label: "Expend Slot",
          callback: async html => {
            const spellLevel = Number(html.querySelector("select").value);
            const slotsAvailable = actor.system.spells[`spell${spellLevel}`].value;
            if ( slotsAvailable < 1 ) {
              return ui.notifications.warn("No available spell slots of selected level.");
            }
            if ( sorceryPointsAvailable >= sorceryPointsMaximum ) {
              return ui.notifications.warn("Cannot exceed maximum sorcery points.");
            }
            await item.displayCard({});
            actor.update({[`system.spells.spell${spellLevel}.value`]: slotsAvailable - 1});
            sorceryPoints.update({"system.uses.value": Math.min(sorceryPointsAvailable + spellLevel, sorceryPointsMaximum)});
            ChatMessage.create({
              speaker: ChatMessage.getSpeaker({actor}),
              content: `
                <div class="dice-roll">
                  <div class="dice-formula" style="margin:0">
                    <i class="fa-regular fa-circle-minus"></i> spell slot level ${spellLevel}
                  </div>
                  <div class="dice-formula" style="margin:0">
                    <i class="fa-regular fa-circle-plus"></i> ${spellLevel} sorcery point${spellLevel < 2 ? "" : "s"}
                  </div>
                </div>
              `
            });
          }
        },
        create: {
          icon: '<i class="fa-solid fa-arrow-up"></i>',
          label: "Create Slot",
          callback: async html => {
            const spellLevel = Number(html.querySelector("select").value);
            if ( spellLevel > 5 ) {
              return ui.notifications.error("Impossible to create spell slots higher in level than 5th.");
            }
            const cost = spellLevel < 3 ? spellLevel + 1 : spellLevel + 2;
            const slotsAvailable = actor.system.spells[`spell${spellLevel}`].value;
            if ( sorceryPointsAvailable < cost ) {
              return ui.notifications.warn("Not enough sorcery points.");
            }
            await item.displayCard({});
            sorceryPoints.update({"system.uses.value": sorceryPointsAvailable - cost});
            actor.update({[`system.spells.spell${spellLevel}.value`]: slotsAvailable + 1});
            ChatMessage.create({
              speaker: ChatMessage.getSpeaker({actor}),
              content: `
                <div class="dice-roll">
                  <div class="dice-formula" style="margin:0">
                    <i class="fa-regular fa-circle-minus"></i> ${cost} sorcery points
                  </div>
                  <div class="dice-formula" style="margin:0">
                    <i class="fa-regular fa-circle-plus"></i> spell slot level ${spellLevel}
                  </div>
                </div>
              `
            });
          }
        }
      },
      default: "create"
    }, {jQuery: false, width: 350}).render(true);

    return false;
  },

  // Modules: Midi QoL ("preItemRoll")
  // OnUse Macro: function.return feanor.features.twinnedSpell
  // Update code to use 'this.options.configureDialog = false'
  twinnedSpell({actor, item}) {
    const sorceryPoints = actor.items.getName("Sorcery Points");
    if ( !sorceryPoints ) {
      ui.notifications.warn("Sorcery points feature not found.");
      return false;
    }
    const sorceryPointsAvailable = sorceryPoints.system.uses.value;
    const spellLevelsAvailable = Object.entries(actor.system.spells).filter(e => e[1].max > 0).map(e => e[0]);
    const options = spellLevelsAvailable.reduce((acc, cur) => {
      return acc += `<option value="${cur.slice(-1)}">${CONFIG.DND5E.spellLevels[cur.slice(-1)].toLowerCase()}</option>`;
    }, '<option value="0">Cantrip</option>');
    const content = `
      <form>
        <div class="form-group" style="text-align:center">
          <label>Spell Level:</label>
          <select style="text-align:center" autofocus>${options}</select>
        </div>
      </form>
    `;

    new Dialog({
      title: "Twinned Spell: Usage Configuration",
      content,
      buttons: {
        twin: {
          icon: '<i class="fa-solid fa-share-nodes"></i>',
          label: "Twin",
          callback: async html => {
            const spellLevel = Number(html.querySelector("select").value);
            const cost = spellLevel || 1;
            if ( sorceryPointsAvailable < cost ) {
              return ui.notifications.warn("Not enough sorcery points.");
            }
            await item.displayCard({});
            sorceryPoints.update({"data.uses.value": sorceryPointsAvailable - cost});
            ChatMessage.create({
              speaker: ChatMessage.getSpeaker({actor}),
              content: `
                <div class="dice-roll">
                  <div class="dice-formula" style="margin:0">
                    <i class="fa-regular fa-circle-minus"></i> ${cost} sorcery point${spellLevel < 2 ? "" : "s"}
                  </div>
                  <div class="dice-formula">
                    Twinned a ${CONFIG.DND5E.spellLevels[spellLevel].toLowerCase()}${spellLevel ? " spell" : ""}
                  </div>
                </div>
              `
            });
          }
        }
      },
      default: "twin"
    }, {jQuery: false, width: 350}).render(true);

    return false;
  },

  // Modules: Midi QoL ("preItemRoll")
  async transmutedSpell({actor, item}) {
    const choices = await Dialog.wait({
      title: "Transmuted Spell: Usage Configuration",
      content: getContent(),
      buttons: {
        transmute: {
          icon: '<i class="fa-solid fa-rotate"></i>',
          label: "Transmute",
          callback: html => {
            const damageOption = html.querySelector("select").value;
            const spellId = html.querySelector('input[name="spell"]:checked')?.value;
            const consumption = html.querySelector('input[name="consumption"]').checked;
            return {damageOption, spellId, consumption};
          }
        }
      },
      close: () => null,
      default: "transmute"
    }, {jQuery: false, top: 0, width: 320});

    if ( !choices ) return false;
    if ( !choices.consumption ) {
      this.config.consumeResource = false;
    } else {
      const consumptionTarget = actor.items.get(item.system.consume.target);
      if ( !consumptionTarget?.system.uses?.value ) {
        ui.notifications.warn(`${item.name} has run out of its designated Item Uses!`);
        return false;
      }
      this.config.needsConfiguration = false;
    }
    if ( choices.spellId ) {
      const spell = actor.items.get(choices.spellId);
      const newDamage = [spell.system.damage.parts[0].with(1, choices.damageOption)];
      const clonedSpell = await spell.clone({"system.damage.parts": newDamage}, {keepId: true});
      clonedSpell.use();
    }

    /**
     * Create the html content for the confirmation dialog
     */
    function getContent() {
      const damageTypes = ["acid", "cold", "fire", "lightning", "poison", "thunder"];
      const damageOptions = damageTypes.reduce((acc, cur) => {
        return acc += `<option value="${cur}" style="text-align:center">${cur.charAt(0).toUpperCase() + cur.slice(1)}</option>`;
      }, "");
      const damageSpells = actor.items.filter(i => i.type === "spell"
        && i.system.damage.parts.some(p => damageTypes.includes(p[1]))
      );
      const spellOptions = damageSpells.length
        ? damageSpells.reduce((acc, cur, i) => {
          const autofocus = i === 0 ? "autofocus" : "";
          return acc += `
            <li class="item">
              <label class="flexrow" ${autofocus}>
                <div class="item-name flexrow rollable">
                  <div class="item-image" style="background-image: url('${cur.img}')"></div>
                  <h4>${cur.name}</h4>
                </div>
                <input type="radio" name="spell" value="${cur.id}" style="flex:0; top:0; margin:0">
              </label>
            </li>
          `;
        }, "")
        : '<li class="item" style="margin:6px 0"><div class="item-name"><h4>No damage spells available</h4></div></li>';
      const spellList = `
        <div class="dnd5e sheet actor" style="min-width:200px">
          <div class="active editable">
            <ol class="items-list inventory-list">
              <li class="items-header flexrow">
                <div class="item-name">
                  <h3>Spell to be transmuted</h3>
                </div>
              </li>
              <ol class="item-list">${spellOptions}</ol>
              <li class="items-header flexrow">
                <div class="item-name">
                  <h3>Transmutation options</h3>
                </div>
              </li>
              <li class="item">
                <div class="item-name flexrow">
                  <h4>New damage type</h4>
                  <select style="margin:3px">${damageOptions}</select>
                </div>
              </li>
              <li class="item">
                <div class="item-name flexrow">
                  <h4>Consume Resource?</h4>
                  <label style="padding: 0 13px 0 0; text-align:center">
                    <input type="checkbox" name="consumption" checked>
                  </label>
                </div>
              </li>
            </ol>
          </div>
        </div>
      `;
      return spellList;
    }
  }

};

export default features;
