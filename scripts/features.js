/**
 * This file is part of the Fëanor Dragorion - D&D 5e Character Automation module
 * MIT License Copyright (c) 2022 Paulo Henrique (PH#2526)
 * https://github.com/paulohdsc/feanor-dragorion/blob/main/LICENSE
 */

const features = {
  // Requires: Item Macro, Midi QoL ("preItemRoll")
  flexibleCasting(args) {
    const actor = fromUuidSync(args[0].actorUuid);
    const item = fromUuidSync(args[0].itemUuid);
    const sorceryPoints = actor.items.getName("Sorcery Points");
    const sorceryPointsLeft = sorceryPoints?.system.uses.value;
    const sorceryPointsMax = sorceryPoints?.system.uses.max;
    if ( !sorceryPointsMax ) {ui.notifications.warn("You must set your sorcery points maximum."); return false;}

    const spellLevels = [{name: "1st level", level: "1", s: "selected"}, {name: "2nd level", level: "2", s: ""}, {name: "3rd level", level: "3", s: ""}, {name: "4th level", level: "4", s: ""}];
    const options = spellLevels.reduce((acc, cur) => acc += `<option value="${cur.level}" ${cur.s}>${cur.name}</option>`, "");
    const content = `<form><div class="form-group"><label>Spell Slot Level:</label><select>${options}</select></div></form>`;

    new Dialog({
      title: "Flexible Casting: Usage Configuration",
      content,
      buttons: {
        Expend: {
          icon: '<i class="fas fa-chevron-down"></i>',
          label: "Expend Slot",
          callback: async html => {
            const spellLevel = html.find("select").val();
            const slotLevel = parseInt(spellLevel);
            const slotsAvailable = actor.system.spells[`spell${spellLevel}`].value;
            if ( slotsAvailable < 1 ) return ui.notifications.warn("No spell slots available.");
            if ( sorceryPointsLeft >= sorceryPointsMax ) return ui.notifications.warn("Impossible to gain more sorcery points.");
            actor.update({[`data.spells.spell${spellLevel}.value`]: slotsAvailable - 1});
            sorceryPoints.update({"data.uses.value": Math.min(sorceryPointsLeft + slotLevel, sorceryPointsMax)});
            await item.displayCard();
            ChatMessage.create({
              speaker: {alias: actor.name},
              content: `<div class="dice-roll">
                <div class="dice-formula">Spent one spell slot level ${spellLevel}</div>
                <div class="dice-formula" style="margin:0">Gained ${spellLevel} SP</div>
              </div>`
            });
          }
        },
        Create: {
          icon: '<i class="fas fa-chevron-up"></i>',
          label: "Create Slot",
          callback: async html => {
            const spellLevel = html.find("select").val();
            const slotLevel = parseInt(spellLevel);
            const cost = slotLevel < 3 ? slotLevel + 1 : slotLevel + 2;
            const slotsAvailable = actor.system.spells[`spell${spellLevel}`].value;
            if ( sorceryPointsLeft < cost ) return ui.notifications.warn("Not enough sorcery points.");
            sorceryPoints.update({"data.uses.value": sorceryPointsLeft - cost});
            actor.update({[`data.spells.spell${spellLevel}.value`]: slotsAvailable + 1});
            await item.displayCard();
            ChatMessage.create({
              speaker: {alias: actor.name},
              content: `<div class="dice-roll">
                <div class="dice-formula">Spent ${cost} SP</div>
                <div class="dice-formula" style="margin:0">Created one spell slot level ${spellLevel}</div>
              </div>`
            });
          }
        }
      },
      render: html => html.find("select").focus(),
      default: "Create"
    }).render(true);

    throw "Flexible Casting: item roll blocked by preItemRoll macro";
  }
};

export default features;
