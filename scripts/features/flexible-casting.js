/**
 * Flexible Casting | Sorcerer 2 | PHB pg. 101
 * Modules: Midi QoL ("preItemRoll")
 */
export function flexibleCasting({actor, item}) {
  const sorceryPoints = actor.items.getName("Sorcery Points");
  if ( !sorceryPoints ) {
    ui.notifications.warn("Sorcery Points feature not found.");
    return false;
  }
  const sorceryPointsAvailable = sorceryPoints.system.uses.value || 0;
  const sorceryPointsMaximum = sorceryPoints.system.uses.max || 0;
  const spellLevelsAvailable = Object.entries(actor.system.spells).filter(sl => sl[1].max > 0).map(sl => sl[0]);
  const options = spellLevelsAvailable.reduce((acc, cur) => {
    return acc += `<option value="${cur.slice(-1)}">${CONFIG.DND5E.spellLevels[cur.slice(-1)]}</option>`;
  }, "");
  const content = `
    <form>
      <p>You can create spell slots no higher in level than 5th.</p>
      <div class="form-group">
        <label style="flex:3;text-align:center">Spell Slot Level:</label>
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
            return ui.notifications.warn("No available spell slots of the selected level.");
          }
          if ( sorceryPointsAvailable >= sorceryPointsMaximum ) {
            return ui.notifications.warn("Cannot exceed the sorcery points maximum.");
          }
          await item.displayCard();
          await actor.update({[`system.spells.spell${spellLevel}.value`]: slotsAvailable - 1}, {render: false});
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
            return ui.notifications.warn("Impossible to create spell slots higher in level than 5th.");
          }
          const cost = spellLevel < 3 ? spellLevel + 1 : spellLevel + 2;
          const slotsAvailable = actor.system.spells[`spell${spellLevel}`].value;
          if ( sorceryPointsAvailable < cost ) {
            return ui.notifications.warn("Not enough sorcery points.");
          }
          await item.displayCard();
          await sorceryPoints.update({"system.uses.value": sorceryPointsAvailable - cost}, {render: false});
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
  }, {jQuery: false}).render(true);

  return false;
}
