/**
 * Flexible Casting | Sorcerer 2 | PHB pg. 101
 * Modules: Midi QoL ("preItemRoll")
 * OnUse Macro: function.return feanor.features.flexibleCasting
 * Update this macro to use 'this.options.configureDialog = false'
 * @param {object} [midiHelpers]        Helper variables provided by Midi QoL
 * @param {Actor} [midiHelpers.actor]   The owner of the item
 * @param {Item} [midiHelpers.item]     The item itself
 * @returns {boolean}
 */
export function flexibleCasting({actor, item}) {
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
}
