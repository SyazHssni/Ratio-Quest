import { Link } from "react-router-dom";
import { Award, Lock, Star } from "lucide-react";
import { PageTitle } from "../components/rq/AppShell";
import { useProgress } from "../context/ProgressContext";
import { BADGES, setPref } from "../lib/progress";
import { CATEGORIES } from "../lib/misconceptions";
import { LESSONS, LESSON_ORDER } from "../data/lessons";
import { Switch } from "../components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog";

export default function ProgressPage() {
  const { progress, update, reset, storageOk } = useProgress();
  const practised = Object.entries(progress.misconceptions).filter(([k]) => CATEGORIES[k]);
  return (
    <div className="space-y-8" data-testid="progress-page">
      <PageTitle title="My Progress" subtitle={storageOk ? "Your progress is saved in this browser on this device only." : "Progress may not be saved on this device."} testid="progress-title" />
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="rq-card p-5" data-testid="progress-points">
          <p className="text-sm font-bold text-slate-600 uppercase">Points</p>
          <p className="font-heading text-4xl font-bold text-slate-900 flex items-center gap-2"><Star className="text-amber-500" fill="#F59E0B" aria-hidden="true" /> {progress.points}</p>
        </div>
        <div className="rq-card p-5" data-testid="progress-badges-count">
          <p className="text-sm font-bold text-slate-600 uppercase">Badges</p>
          <p className="font-heading text-4xl font-bold text-slate-900">{progress.badges.length} / {BADGES.length}</p>
        </div>
        <div className="rq-card p-5" data-testid="progress-final">
          <p className="text-sm font-bold text-slate-600 uppercase">Final Challenge</p>
          <p className="font-heading text-2xl font-bold text-slate-900">{progress.final.best === null ? "Not tried yet" : `Best ${progress.final.best}/15`}</p>
          {progress.final.last !== null && <p className="text-sm text-slate-700">Latest {progress.final.last}/15 · {progress.final.attempts} attempt(s)</p>}
        </div>
      </div>

      <section className="space-y-3" aria-labelledby="mastery-heading">
        <h2 id="mastery-heading" className="font-heading text-2xl font-bold text-slate-900">Checkpoints</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {LESSON_ORDER.map((id) => {
            const l = progress.lessons[id];
            return (
              <div key={id} className="rq-card p-5 space-y-1" data-testid={`progress-lesson-${id}`}>
                <p className="font-heading text-lg font-semibold text-slate-900">{LESSONS[id].title}</p>
                <p className="font-semibold text-slate-800">{l.mastered ? "Mastered" : l.taught ? "Learning" : "Not started"}</p>
                <p className="text-sm text-slate-700">Best: {l.bestScore ?? "–"}/5 · Latest: {l.lastScore ?? "–"}/5 · Attempts: {l.attempts}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="badges-heading">
        <h2 id="badges-heading" className="font-heading text-2xl font-bold text-slate-900">Badges</h2>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BADGES.map((b) => {
            const has = progress.badges.includes(b.id);
            return (
              <li key={b.id} className={`rq-card p-4 flex items-center gap-3 ${has ? "border-amber-300 bg-amber-50" : "opacity-70"}`} data-testid={`badge-${b.id}`}>
                {has ? <Award size={36} className="text-amber-600" aria-hidden="true" /> : <Lock size={32} className="text-slate-400" aria-hidden="true" />}
                <div>
                  <p className="font-semibold text-slate-900">{b.name} <span className="sr-only">{has ? "earned" : "not earned yet"}</span></p>
                  <p className="text-sm text-slate-700">{has ? b.desc : `To earn: ${b.desc.toLowerCase()}`}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rq-card p-5 space-y-2" aria-labelledby="practised-heading" data-testid="progress-practised">
        <h2 id="practised-heading" className="font-heading text-xl font-bold text-slate-900">Things we have been practising</h2>
        {practised.length === 0 ? (
          <p className="text-slate-700">Nothing yet — keep exploring!</p>
        ) : (
          <ul className="list-disc pl-6 text-slate-800">
            {practised.map(([k, n]) => (
              <li key={k}>{CATEGORIES[k].pupil} ({n})</li>
            ))}
          </ul>
        )}
        <p className="text-sm text-slate-600">Hints used: {progress.hintsUsed}. Using hints is a smart way to learn!</p>
      </section>

      <section className="rq-card p-5 space-y-4" aria-labelledby="settings-heading">
        <h2 id="settings-heading" className="font-heading text-xl font-bold text-slate-900">Settings</h2>
        <div className="flex items-center gap-3">
          <Switch id="reduce-motion" checked={progress.prefs.reduceMotion} onCheckedChange={(v) => update((s) => setPref(s, "reduceMotion", v))} data-testid="reduce-motion-switch" />
          <label htmlFor="reduce-motion" className="font-semibold text-slate-800">Calm mode (less movement)</label>
        </div>
        <AlertDialog>
          <AlertDialogTrigger className="rq-btn-secondary" data-testid="reset-progress-btn">Reset my progress</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Start again from the beginning?</AlertDialogTitle>
              <AlertDialogDescription>This removes your points, badges and lesson progress from this device.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="reset-cancel-btn">Keep my progress</AlertDialogCancel>
              <AlertDialogAction onClick={reset} data-testid="reset-confirm-btn">Yes, reset</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <p className="text-sm text-slate-600">No account or personal details are needed. <Link to="/teacher" className="underline">Teachers: see Teacher Corner</Link>.</p>
      </section>
    </div>
  );
}
