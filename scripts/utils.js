// MIT License (c) 2022 Paulo Henrique (PH#2526)

const utils = {

  getContext(args) {
    const lastArg = args[args.length - 1];
    const doc = fromUuidSync(lastArg.actorUuid);
    const actor = doc instanceof TokenDocument ? doc.actor : doc;
    const token = fromUuidSync(lastArg.tokenUuid)?.object;
    const item = fromUuidSync(lastArg.itemUuid ?? lastArg.origin);
    const spellLevel = lastArg.spellLevel;
    const targets = lastArg.targets;
    const hitTargets = lastArg.hitTargets;
    return {lastArg, actor, token, item, spellLevel, targets, hitTargets};
  },

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

};

export default utils;
