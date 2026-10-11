import { Music2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useAudio } from "../../audio/AudioContext";

export function AudioControls() {
  const {
    effectsEnabled, effectsVolume, musicVolume, musicPlaying, musicError,
    setEffectsEnabled, setEffectsVolume, setMusicVolume, toggleMusic,
  } = useAudio();

  return (
    <details className="relative shrink-0" data-testid="audio-controls">
      <summary className="audio-summary inline-flex min-h-[42px] cursor-pointer list-none items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-2 sm:px-3 text-sm font-semibold text-slate-800 hover:border-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700">
        <Music2 size={18} aria-hidden="true" /> <span className="hidden sm:inline">Audio</span>
        <span className="sr-only">settings</span>
      </summary>
      <section className="absolute right-0 top-full z-50 mt-2 w-[min(19rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl" aria-label="Audio settings">
        <h2 className="font-heading text-lg font-bold">Audio settings</h2>
        <div className="mt-3 space-y-4">
          <div className="space-y-2">
            <button type="button" className="rq-btn-secondary w-full justify-start" onClick={toggleMusic} aria-label={musicPlaying ? "Pause background music" : "Play background music"} aria-pressed={musicPlaying} data-testid="music-toggle">
              {musicPlaying ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
              {musicPlaying ? "Pause music" : "Play music"}
              <span className="ml-auto text-xs text-slate-600">{musicPlaying ? "On" : "Off"}</span>
            </button>
            <label htmlFor="music-volume" className="flex items-center justify-between gap-3 text-sm font-semibold">
              <span className="flex items-center gap-2"><Music2 size={16} aria-hidden="true" /> Music volume</span>
              <span>{Math.round(musicVolume * 100)}%</span>
            </label>
            <input id="music-volume" aria-label="Music volume" data-testid="music-volume" className="audio-volume w-full" type="range" min="0" max="1" step="0.01" value={musicVolume} onChange={(e) => setMusicVolume(Number(e.target.value))} />
          </div>
          <div className="space-y-2 border-t border-slate-200 pt-3">
            <button type="button" className="rq-btn-secondary w-full justify-start" onClick={() => setEffectsEnabled(!effectsEnabled)} aria-label={effectsEnabled ? "Disable sound effects" : "Enable sound effects"} aria-pressed={effectsEnabled} data-testid="effects-toggle">
              {effectsEnabled ? <Volume2 size={18} aria-hidden="true" /> : <VolumeX size={18} aria-hidden="true" />}
              Sound effects <span className="ml-auto text-xs text-slate-600">{effectsEnabled ? "On" : "Off"}</span>
            </button>
            <label htmlFor="effects-volume" className="flex items-center justify-between gap-3 text-sm font-semibold">
              <span className="flex items-center gap-2"><Volume2 size={16} aria-hidden="true" /> Effects volume</span>
              <span>{Math.round(effectsVolume * 100)}%</span>
            </label>
            <input id="effects-volume" aria-label="Effects volume" data-testid="effects-volume" className="audio-volume w-full" type="range" min="0" max="1" step="0.01" value={effectsVolume} onChange={(e) => setEffectsVolume(Number(e.target.value))} />
          </div>
        </div>
        {musicError && <p className="mt-3 text-sm font-semibold text-orange-800" role="alert">{musicError}</p>}
        <p className="mt-3 text-xs text-slate-500">Music and sound effects have separate controls. Your choices stay on this device.</p>
      </section>
    </details>
  );
}
