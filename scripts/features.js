console.log("%cFEATURES LOADED", "color:green");

/**
 * Elemental Affinity automation macro for DnD5e
 * MIT License Copyright (c) 2022 Paulo Henrique (PH#2526)
 * Required modules: Item Macro, Midi QoL
 * Usage: Run as ItemMacro via Midi's On Use Macro on the item sheet ("preItemRoll")
 */
async function elementalAffinity(args, actor, item) {
	const ctrl = game.keyboard.isModifierActive("Control");
	const fireDamageBonusData = `{"changes":[{"key":"data.bonuses.spell.damage","mode":2,"value":"@abilities.cha.mod"},{"key":"data.bonuses.save.damage","mode":2,"value":"@abilities.cha.mod"},{"key":"data.bonuses.util.damage","mode":2,"value":"@abilities.cha.mod"}],"icon":"icons/magic/fire/flame-burning-fist-strike.webp","label":"Fire Damage Bonus","origin":"${item.uuid}","flags":{"dae":{"specialDuration":["DamageDealt"]},"core":{"statusId":"Elemental Affinity"}}}`;
	const fireResistanceData = `{"changes":[{"key":"data.traits.dr.value","mode":2,"value":"fire"}],"duration":{"seconds":3600},"icon":"icons/equipment/shield/heater-stone-orange.webp","label":"Fire Resistance","origin":"${item.uuid}"}`;

	if ( !ctrl ) {
		const fireDamageBonus = actor.effects.find(e => e.data.label === "Fire Damage Bonus");
		if ( !fireDamageBonus ) actor.createEmbeddedDocuments("ActiveEffect", [JSON.parse(fireDamageBonusData)]);
		else fireDamageBonus.delete();
	} else {
		const fireResistance = actor.effects.find(e => e.data.label === "Fire Resistance");
		if ( !fireResistance ) {
			const sorceryPoints = actor.items.getName("Sorcery Points");
			const sorceryPointsLeft = sorceryPoints?.data.data.uses.value;
			if ( sorceryPointsLeft ) {
				await item.displayCard();
				await ChatMessage.create({
					speaker: {alias: actor.name},
					content: '<div class="dice-roll"><div class="dice-formula">Spent 1 SP to gain Fire Resistance</div></div>'
				});
				sorceryPoints.update({"data.uses.value": sorceryPointsLeft - 1});
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

globalThis.feanorDragorion = {
	elementalAffinity
};