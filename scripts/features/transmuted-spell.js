/**
 * Transmuted Spell | Sorcerer 3 | TCE pg. 66
 * Modules: Midi QoL ("preItemRoll")
 * @param {object} [midiHelpers]        Helper variables provided by Midi QoL
 * @param {Actor} [midiHelpers.actor]   The owner of the item
 * @param {Item} [midiHelpers.item]     The item itself
 */
export async function transmutedSpell({actor, item}) {
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
                <h3>Eligible Spells</h3>
              </div>
            </li>
            <ol class="item-list">${spellOptions}</ol>
            <li class="items-header flexrow">
              <div class="item-name">
                <h3>Options</h3>
              </div>
            </li>
            <li class="item">
              <div class="item-name flexrow">
                <h4>New Damage Type</h4>
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
