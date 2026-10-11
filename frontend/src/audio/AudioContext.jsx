import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AUDIO_ASSETS, audioAssetUrl } from "./config";

const AudioSettingsContext = createContext(null);
const STORAGE_KEY = "ratio-quest-audio-v1";
const DEFAULTS = { effectsEnabled: true, effectsVolume: 0.45, musicVolume: 0.18 };
const FALLBACK_NOTES = {
  click: [660, 0.045], select: [520, 0.08], correct: [784, 0.18], incorrect: [260, 0.13],
  hint: [587, 0.11], next: [698, 0.09], levelStart: [523, 0.18], levelComplete: [880, 0.24],
  achievement: [988, 0.3], unavailable: [330, 0.1],
};

function readSettings() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
  } catch {
    return DEFAULTS;
  }
}

export function AudioProvider({ children }) {
  const [settings, setSettings] = useState(readSettings);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicError, setMusicError] = useState("");
  const musicRef = useRef(null);
  const effectRef = useRef(null);
  const lastEffectRef = useRef({ event: "", at: 0 });
  const audioContextRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch { /* private browsing may block storage */ }
  }, [settings]);

  useEffect(() => () => {
    if (musicRef.current) { musicRef.current.pause(); musicRef.current.src = ""; }
    if (effectRef.current) { effectRef.current.pause(); effectRef.current.src = ""; }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") audioContextRef.current.close().catch(() => {});
  }, []);

  const playFallback = useCallback((event) => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const context = audioContextRef.current || new AudioContextClass();
      audioContextRef.current = context;
      if (context.state === "suspended") context.resume().catch(() => {});
      const [frequency, duration] = FALLBACK_NOTES[event] || FALLBACK_NOTES.click;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, settings.effectsVolume * 0.055), context.currentTime + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + duration + 0.02);
    } catch { /* audio is an enhancement; never interrupt learning */ }
  }, [settings.effectsVolume]);

  const playSound = useCallback((event = "click") => {
    if (!settings.effectsEnabled || !AUDIO_ASSETS.events[event]) return;
    const now = Date.now();
    const last = lastEffectRef.current;
    if (event === last.event && now - last.at < 90) return;
    lastEffectRef.current = { event, at: now };
    if (effectRef.current) { effectRef.current.pause(); effectRef.current.currentTime = 0; }
    let audio;
    try { audio = new Audio(audioAssetUrl(AUDIO_ASSETS.events[event])); }
    catch { playFallback(event); return; }
    audio.preload = "none";
    audio.volume = settings.effectsVolume;
    effectRef.current = audio;
    let fallbackUsed = false;
    const fallback = () => { if (!fallbackUsed) { fallbackUsed = true; playFallback(event); } };
    audio.addEventListener("error", fallback, { once: true });
    try {
      const playback = audio.play();
      playback?.catch(fallback);
    } catch { fallback(); }
  }, [playFallback, settings.effectsEnabled, settings.effectsVolume]);

  const setEffectsEnabled = useCallback((enabled) => {
    if (!enabled && effectRef.current) effectRef.current.pause();
    setSettings((s) => ({ ...s, effectsEnabled: enabled }));
  }, []);
  const setEffectsVolume = useCallback((volume) => setSettings((s) => ({ ...s, effectsVolume: volume })), []);
  const setMusicVolume = useCallback((volume) => {
    setSettings((s) => ({ ...s, musicVolume: volume }));
    if (musicRef.current) musicRef.current.volume = volume;
  }, []);

  const toggleMusic = useCallback(async () => {
    setMusicError("");
    if (musicPlaying && musicRef.current) {
      musicRef.current.pause();
      setMusicPlaying(false);
      return;
    }
    try {
      let audio = musicRef.current;
      if (!audio) {
        audio = new Audio(audioAssetUrl(AUDIO_ASSETS.music));
        audio.loop = true;
        audio.preload = "none";
        audio.volume = settings.musicVolume;
        audio.addEventListener("playing", () => setMusicPlaying(true));
        audio.addEventListener("pause", () => setMusicPlaying(false));
        audio.addEventListener("error", () => {
          setMusicPlaying(false);
          setMusicError("Music could not start. Check the background audio file or try again.");
        });
        musicRef.current = audio;
      }
      await audio.play();
      setMusicPlaying(true);
    } catch {
      setMusicPlaying(false);
      setMusicError("Music could not start. Check the background audio file or try again.");
      playSound("unavailable");
    }
  }, [musicPlaying, settings.musicVolume, playSound]);

  const value = useMemo(() => ({
    ...settings, musicPlaying, musicError, playSound, toggleMusic,
    setEffectsEnabled, setEffectsVolume, setMusicVolume,
  }), [settings, musicPlaying, musicError, playSound, toggleMusic, setEffectsEnabled, setEffectsVolume, setMusicVolume]);
  return <AudioSettingsContext.Provider value={value}>{children}</AudioSettingsContext.Provider>;
}

export function useAudio() {
  const context = useContext(AudioSettingsContext);
  if (!context) throw new Error("useAudio must be used within AudioProvider");
  return context;
}
