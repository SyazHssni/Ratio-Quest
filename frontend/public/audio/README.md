# Developer audio assets

Pupils control playback and volume from **Audio** in the site header. There is no public upload or asset editor. Replace the files below inside the project to customise the site audio; no database or backend is involved.

| Purpose | Project file | Suggested duration |
| --- | --- | --- |
| Background music | `music/background.wav` | 1–3 minutes, loop-friendly |
| Button activation | `sfx/click.wav` | 0.05–0.15 seconds |
| Answer selection | `sfx/select.wav` | 0.05–0.2 seconds |
| Correct answer | `sfx/correct.wav` | 0.15–0.6 seconds |
| Incorrect answer | `sfx/incorrect.wav` | 0.15–0.5 seconds |
| Hint opened | `sfx/hint.wav` | 0.1–0.4 seconds |
| Next question | `sfx/next.wav` | 0.1–0.3 seconds |
| Session started | `sfx/level-start.wav` | 0.2–0.6 seconds |
| Session completed | `sfx/level-complete.wav` | 0.4–1.2 seconds |
| Achievement | `sfx/achievement.wav` | 0.3–1 second |
| Unavailable action | `sfx/unavailable.wav` | 0.1–0.3 seconds |

WAV, MP3, and OGG are supported by current browsers; this project ships small WAV defaults for predictable local playback. Keep effects short and comfortably quiet. If using a different filename or format, update the matching path in `src/audio/config.js`. That file is the single event-to-asset map. `PUBLIC_URL` is added automatically, so configured files work when the app is deployed under a subpath.

Audio files are ordinary public website assets and may be downloaded by visitors. Keep private recordings out of this directory. Missing sound-effect files fall back to quiet synthesized tones. If the music file is unavailable, the player reports that playback could not start; it does not pretend music is playing.
