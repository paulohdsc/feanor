/**
 * Twinned Spell | Sorcerer 3 | PHB pg. 102
 * Modules: Midi QoL ("preItemRoll")
 */
export function twinnedSpell({actor, item}) {
  const sorceryPoints = actor.items.getName("Sorcery Points");
  if ( !sorceryPoints ) {
    ui.notifications.warn("Sorcery points feature not found.");
    return false;
  }
  const sorceryPointsAvailable = sorceryPoints.system.uses.value;
  const spellLevelsAvailable = Object.entries(actor.system.spells).filter(sl => sl[1].max > 0).map(sl => sl[0]);
  const options = spellLevelsAvailable.reduce((acc, cur) => {
    return acc += `<option value="${cur.slice(-1)}">${CONFIG.DND5E.spellLevels[cur.slice(-1)].toLowerCase()}</option>`;
  }, '<option value="0">Cantrip</option>');
  const content = `
    <form>
      <div class="form-group">
        <label style="text-align:center">Spell Level:</label>
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
          await item.displayCard();
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
}
