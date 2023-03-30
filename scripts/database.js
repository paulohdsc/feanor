// MIT License (c) 2022 Paulo Henrique (PH#2526)

const database = {
  audio: {
    channeling: {
      lightning: "upload-player/feanor/chromatic-orb-casting.wav" // Convert to .ogg and insert original file metadata
    },
    disintegrate: "modules/feanor-dragorion/assets/audio/disintegrate.ogg",
    impact: {
      lightning: [
        "upload-player/feanor/shocking-grasp.wav", // Convert to .ogg and insert original file metadata
        "modules/soundfxlibrary/Combat/Single/Spell%20Impact%20Lightning/spell-impact-lightning-4.mp3" // Convert to .ogg and insert original file metadata
      ]
    }
  },
  image: {
    pile_of_dust: "modules/feanor-dragorion/assets/image/pile-of-dust.webp"
  }
};

// const database = {
//   sounds: {
//     channeling: {
//       lightning: "upload-player/feanor/chromatic-orb-casting.wav"
//     },
//     impact: {
//       lightning: [
//         "upload-player/feanor/shocking-grasp.wav",
//         "modules/soundfxlibrary/Combat/Single/Spell%20Impact%20Lightning/spell-impact-lightning-4.mp3"
//       ]
//     }
//   },
//   effects: {
//     chain_lightning: {
//       primary: {
//         blue: "jb2a.chain_lightning.primary.blue"
//       },
//       secondary: {
//         blue: "jb2a.chain_lightning.secondary.blue"
//       }
//     },
//     lightning_ball: {
//       blue: "jb2a.lightning_ball.blue"
//     },
//     static_electricity: {
//       "01": {
//         blue: "jb2a.static_electricity.01.blue"
//       },
//       "02": {
//         blue: "jb2a.static_electricity.02.blue"
//       },
//       "03": {
//         blue: "jb2a.static_electricity.03.blue"
//       }
//     }
//   }
// };

// const database = {
//   sounds: {
//     casting: "upload-player/feanor/chromatic-orb-casting.wav",
//     lightningStrike1: "upload-player/feanor/shocking-grasp.wav",
//     lightningStrike2: "modules/soundfxlibrary/Combat/Single/Spell%20Impact%20Lightning/spell-impact-lightning-4.mp3"
//   },
//   effects: {
//     staticElectricity1: "jb2a.static_electricity.01.blue",
//     staticElectricity2: "jb2a.static_electricity.02.blue",
//     staticElectricity3: "jb2a.static_electricity.03.blue",
//     lightningBall: "jb2a.lightning_ball.blue",
//     chainLightning1: "jb2a.chain_lightning.primary.blue",
//     chainLightning2: "jb2a.chain_lightning.secondary.blue"
//   }
// };

export default database;
