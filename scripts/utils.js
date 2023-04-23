const utils = {

  // getContext(args) {
  //   const lastArg = args[args.length - 1];
  //   const doc = fromUuidSync(lastArg.actorUuid);
  //   const actor = doc instanceof TokenDocument ? doc.actor : doc;
  //   const token = fromUuidSync(lastArg.tokenUuid)?.object;
  //   const item = fromUuidSync(lastArg.itemUuid ?? lastArg.origin);
  //   const spellLevel = lastArg.spellLevel;
  //   const targets = lastArg.targets;
  //   const hitTargets = lastArg.hitTargets;
  //   return {lastArg, actor, token, item, spellLevel, targets, hitTargets};
  // },

  preload(obj) {
    const flatObj = flattenObject(obj);
    for ( const [k, v] of Object.entries(flatObj) ) {
      if ( Array.isArray(v) ) flatObj[k] = {...v};
    }
    const flatArray = Object.values(flattenObject(flatObj));
    const srcArray = flatArray.filter(value => typeof value === "string" && value);
    return Sequencer.Preloader.preloadForClients(srcArray);
  },

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

};

export default utils;
