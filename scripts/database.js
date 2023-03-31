// MIT License (c) 2022 Paulo Henrique (PH#2526)

// Review database (add jb2a and soundfxlibrary paths)
// Convert to .ogg and insert original file metadata

const database = {
  boots_of_speed: {
    effects: {

    }
  }
};

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
  disintegrate: {
    effects: {
      pile_of_dust: "modules/feanor/assets/disintegrate/pile-of-dust.webp"
    },
    sounds: {
      casting: "modules/feanor/assets/disintegrate/casting.ogg"
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

export default database;
