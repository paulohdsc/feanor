// Review database (add jb2a, soundfxlibrary and 5e animations paths)
// Convert to .ogg and insert original file metadata
// See https://github.com/jackkerouac/animated-spell-effects-cartoon/tree/master/sound-fx

export const db = {};

db.ashardalons_stride = {
  effects: {
    magic_circle: "jb2a.magic_signs.circle.02.transmutation.complete.yellow",
    on_cast: {
      acid: "",
      // cold: "modules/JB2A_DnD5e/Library/Generic/Ice/SnowflakeBurst_01_Regular_BlueWhite_Loop_600x600.webm",
      cold: "jb2a.impact.frost.white.01",
      fire: "jb2a.eruption.orange.01",
      lightning: "jb2a.impact.011.blue",
      poison: "",
      thunder: "jb2a.impact.011.blue"
    },
    trail: { // Must be an array
      acid: [
        "jb2a.liquid.splash.blue"
      ],
      cold: [
        "jb2a.impact_themed.ice_shard.blue"
        // "jb2a.impact.frost.white.01"
      ],
      fire: [
        "jb2a.flames.orange.03.1x1",
        "jb2a.flames.orange.03.2x1",
        "jb2a.flames.orange.03.2x2"
      ],
      lightning: [
        "jb2a.impact.011.blue",
        "jb2a.impact.012.blue"
      ],
      poison: [
        "jb2a.smoke.puff.centered.grey.0",
        "jb2a.smoke.puff.centered.grey.1",
        "jb2a.smoke.puff.centered.grey.2"
      ],
      thunder: [
        "jb2a.thunderwave.center.blue"
      ]
    }
  },
  sounds: {
    chant: "modules/feanor/sounds/school-chants/transmutation.wav",
    on_cast: {
      acid: "",
      cold: "modules/feanor/sounds/inflict-cold.wav",
      fire: "modules/feanor/sounds/inflict-fire.wav",
      lightning: "modules/feanor/sounds/inflict-lightning.wav",
      poison: "",
      thunder: "modules/soundfxlibrary/Nature/Single/Thunder/thunder-7.mp3"
    }
  },
  trail_delay: {}
};

db.boots_of_speed = {
  effects: {
    transmute: "jb2a.energy_strands.complete.blue.01"
  },
  sounds: {
    transmute: "modules/feanor/sounds/transmute.wav"
  }
};

db.disintegrate = {
  effects: {
    projectile: "jb2a.disintegrate.green",
    impact: "jb2a.impact.004.blue",
    pile_of_dust: "modules/feanor/images/pile-of-dust.webp"
  },
  sounds: {
    projectile: "modules/feanor/sounds/disintegrate.ogg"
  }
};

/* -------------------------------------------------- */

const database4 = {
  chain_lightning: {
    effects: {
      primary: "jb2a.chain_lightning.primary.blue",
      secondary: "jb2a.chain_lightning.secondary.blue",
      lightning_ball: "jb2a.lightning_ball.blue",
      static_electricity_1: "jb2a.static_electricity.01.blue",
      static_electricity_2: "jb2a.static_electricity.02.blue",
      static_electricity_3: "jb2a.static_electricity.03.blue"
    },
    sounds: {
      channeling: "upload-player/feanor/chromatic-orb-casting.wav",
      impact_1: "upload-player/feanor/shocking-grasp.wav",
      impact_2: "modules/soundfxlibrary/Combat/Single/Spell%20Impact%20Lightning/spell-impact-lightning-4.mp3"
    }
  },
  magic_missile: {
    sounds: {
      missiles: [
        "modules/feanor/assets/magic-missile/magic-missile-1.mp3",
        "modules/feanor/assets/magic-missile/magic-missile-2.mp3",
        "modules/feanor/assets/magic-missile/magic-missile-3.mp3",
        "modules/feanor/assets/magic-missile/magic-missile-4.mp3",
        "modules/feanor/assets/magic-missile/magic-missile-5.mp3",
        "modules/feanor/assets/magic-missile/magic-missile-6.mp3",
        "modules/feanor/assets/magic-missile/magic-missile-7.mp3",
        "modules/feanor/assets/magic-missile/magic-missile-8.mp3"
      ]
    }
  },
  minor_illusion: {
    effects: {
      bush: "modules/feanor/assets/minor-illusion/bush.webp",
      crate: "modules/feanor/assets/minor-illusion/crate.webp",
      door: "modules/feanor/assets/minor-illusion/door.webp",
      generic: "modules/feanor/assets/minor-illusion/generic.webp",
      rock: "modules/feanor/assets/minor-illusion/rock.webp",
      sack: "modules/feanor/assets/minor-illusion/sack.webp",
      treasure_chest: "modules/feanor/assets/minor-illusion/treasure-chest.webp",
      treasure_pile: "modules/feanor/assets/minor-illusion/treasure-pile.webp"
    }
  },
  wall_of_fire: {
    effects: {
      line: "modules/feanor/assets/wall-of-fire/line.webp",
      ring_inward: "modules/feanor/assets/wall-of-fire/ring-inward.webp",
      ring_outward: "modules/feanor/assets/wall-of-fire/ring-outward.webp"
    },
    sounds: {
      casting: "modules/feanor/assets/wall-of-fire/casting.ogg",
      ongoing: "modules/feanor/assets/wall-of-fire/ongoing.ogg"
    }
  }
};

const database3 = {
  audio: {
    channeling: {
      lightning: "upload-player/feanor/chromatic-orb-casting.wav"
    },
    disintegrate: "modules/feanor-dragorion/assets/audio/disintegrate.ogg",
    impact: {
      lightning: [
        "upload-player/feanor/shocking-grasp.wav",
        "modules/soundfxlibrary/Combat/Single/Spell%20Impact%20Lightning/spell-impact-lightning-4.mp3"
      ]
    }
  },
  image: {
    pile_of_dust: "modules/feanor-dragorion/assets/image/pile-of-dust.webp"
  }
};

const database2 = {
  sounds: {
    channeling: {
      lightning: "upload-player/feanor/chromatic-orb-casting.wav"
    },
    impact: {
      lightning: [
        "upload-player/feanor/shocking-grasp.wav",
        "modules/soundfxlibrary/Combat/Single/Spell%20Impact%20Lightning/spell-impact-lightning-4.mp3"
      ]
    }
  },
  effects: {
    chain_lightning: {
      primary: {
        blue: "jb2a.chain_lightning.primary.blue"
      },
      secondary: {
        blue: "jb2a.chain_lightning.secondary.blue"
      }
    },
    lightning_ball: {
      blue: "jb2a.lightning_ball.blue"
    },
    static_electricity: {
      "01": {
        blue: "jb2a.static_electricity.01.blue"
      },
      "02": {
        blue: "jb2a.static_electricity.02.blue"
      },
      "03": {
        blue: "jb2a.static_electricity.03.blue"
      }
    }
  }
};

const database1 = {
  sounds: {
    casting: "upload-player/feanor/chromatic-orb-casting.wav",
    lightningStrike1: "upload-player/feanor/shocking-grasp.wav",
    lightningStrike2: "modules/soundfxlibrary/Combat/Single/Spell%20Impact%20Lightning/spell-impact-lightning-4.mp3"
  },
  effects: {
    staticElectricity1: "jb2a.static_electricity.01.blue",
    staticElectricity2: "jb2a.static_electricity.02.blue",
    staticElectricity3: "jb2a.static_electricity.03.blue",
    lightningBall: "jb2a.lightning_ball.blue",
    chainLightning1: "jb2a.chain_lightning.primary.blue",
    chainLightning2: "jb2a.chain_lightning.secondary.blue"
  }
};
