/**
 * This file is part of the Fëanor Dragorion module (https://github.com/paulohdsc/feanor-dragorion/).
 * MIT License Copyright (c) 2022 Paulo Henrique (PH#2526).
 * You should have received a copy of the MIT License along with this module.
 * If not, see <https://mit-license.org/>.
 */

/**
 * Elemental Affinity
 * Required modules: Item Macro, Midi QoL ("preItemRoll")
 */
async function elementalAffinity(args) {
	console.log(args); // DELETAR
	const ctrl = game.keyboard.isModifierActive("Control");
	const actor = fromUuidSync(args[0].actorUuid);
	const item = fromUuidSync(args[0].itemUuid);
	const fireDamageBonusData = `{"changes":[{"key":"system.bonuses.spell.damage","mode":2,"value":"@abilities.cha.mod"},{"key":"system.bonuses.save.damage","mode":2,"value":"@abilities.cha.mod"},{"key":"system.bonuses.util.damage","mode":2,"value":"@abilities.cha.mod"}],"icon":"icons/magic/fire/flame-burning-fist-strike.webp","label":"Fire Damage Bonus","origin":"${item.uuid}","flags":{"dae":{"specialDuration":["DamageDealt"]},"core":{"statusId":"Elemental Affinity"}}}`;
	const fireResistanceData = `{"changes":[{"key":"system.traits.dr.value","mode":2,"value":"fire"}],"duration":{"seconds":3600},"icon":"icons/equipment/shield/heater-stone-orange.webp","label":"Fire Resistance","origin":"${item.uuid}"}`;

	if ( !ctrl ) {
		const fireDamageBonus = actor.effects.find(e => e.label === "Fire Damage Bonus");
		if ( !fireDamageBonus ) actor.createEmbeddedDocuments("ActiveEffect", [JSON.parse(fireDamageBonusData)]);
		else fireDamageBonus.delete();
	} else {
		const fireResistance = actor.effects.find(e => e.label === "Fire Resistance");
		if ( !fireResistance ) {
			const sorceryPoints = actor.items.getName("Sorcery Points");
			const sorceryPointsLeft = sorceryPoints?.system.uses.value;
			if ( sorceryPointsLeft ) {
				await item.displayCard();
				await ChatMessage.create({
					speaker: {alias: actor.name},
					content: '<div class="dice-roll"><div class="dice-formula">Spent 1 SP to gain Fire Resistance</div></div>'
				});
				sorceryPoints.update({"system.uses.value": sorceryPointsLeft - 1});
				actor.createEmbeddedDocuments("ActiveEffect", [JSON.parse(fireResistanceData)]);
			} else ui.notifications.warn("No sorcery points available.");
		} else {
			await item.displayCard();
			await ChatMessage.create({
				speaker: {alias: actor.name},
				content: '<div class="dice-roll"><div class="dice-formula">Lost Fire Resistance</div></div>'
			});
			fireResistance.delete();
		}
	}
	throw "Elemental Affinity: item roll blocked by preItemRoll macro";	// Alternative: return false;
};

export { elementalAffinity };