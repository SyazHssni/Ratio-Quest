// Developer-managed audio map. Replace files in public/audio/ or change paths here.
// Keep PUBLIC_URL in the URL builder so assets work when deployed under a base path.
export const AUDIO_ASSETS = {
  music: "/audio/music/background.wav",
  events: {
    click: "/audio/sfx/click.wav",
    select: "/audio/sfx/select.wav",
    correct: "/audio/sfx/correct.wav",
    incorrect: "/audio/sfx/incorrect.wav",
    hint: "/audio/sfx/hint.wav",
    next: "/audio/sfx/next.wav",
    levelStart: "/audio/sfx/level-start.wav",
    levelComplete: "/audio/sfx/level-complete.wav",
    achievement: "/audio/sfx/achievement.wav",
    unavailable: "/audio/sfx/unavailable.wav",
  },
};

export const audioAssetUrl = (path) => `${(process.env.PUBLIC_URL || "").replace(/\/$/, "")}${path}`;
