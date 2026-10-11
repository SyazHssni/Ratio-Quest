import { useState } from "react";
import { Link } from "react-router-dom";
import { Lock, Trophy, CheckCircle2, CircleDot } from "lucide-react";
import { PageTitle } from "../components/rq/AppShell";
import { QuestionRunner } from "../components/rq/QuestionRunner";
import { RafiSays } from "../components/rq/Rafi";
import { useProgress } from "../context/ProgressContext";
import { allCoreMastered, recordFinal, setLastActivity } from "../lib/progress";
import { buildFinalSet, finalResult, TYPE_NAMES } from "../lib/mastery";
import { useAudio } from "../audio/AudioContext";
import { useCourse } from "../context/CourseContext";
import { Year6Practice } from "./Year6Activities";

function Results({ r, onRetry }) {
  return (
    <div className="rq-summary-enter space-y-6" data-testid="final-results" aria-live="polite">
      <div className="flex items-center gap-4">
        <Trophy size={56} className={r.passed ? "text-amber-500" : "text-slate-400"} aria-hidden="true" />
        <div>
          <p className="font-heading text-3xl font-bold text-slate-900" data-testid="final-score">{r.score} out of {r.total}</p>
          <p className="text-lg text-slate-700">{r.passed ? "You passed the Final Challenge. You are a Ratio Master!" : "Good effort! You are building strong ratio skills."}</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        {Object.entries(r.byType).map(([t, v]) => (
          <div key={t} className={`rounded-2xl border-2 p-4 ${v.correct >= 4 ? "border-green-400 bg-green-50" : "border-orange-300 bg-orange-50"}`} data-testid={`final-type-${t}`}>
            <p className="font-semibold text-slate-900 flex items-center gap-2">
              {v.correct >= 4 ? <CheckCircle2 size={18} aria-hidden="true" /> : <CircleDot size={18} aria-hidden="true" />} {TYPE_NAMES[t]}
            </p>
            <p className="ratio-mono text-2xl font-bold text-slate-900">{v.correct} / {v.total}</p>
            <p className="text-sm text-slate-700">{v.correct >= 4 ? "Shown" : "Needs more practice"}</p>
          </div>
        ))}
      </div>
      {r.demonstrated.length > 0 && <p className="text-slate-800"><strong>You have shown:</strong> {r.demonstrated.join(", ")}.</p>}
      {r.needsPractice.length > 0 && <p className="text-slate-800"><strong>Let's practise:</strong> {r.needsPractice.join(", ")}.</p>}
      {!r.sameSetOk && <p className="text-slate-800">Tip: some questions used the same gems and coins in different ways. The question decides the ratio.</p>}
      <RafiSays testid="final-next-step">{r.next.text}</RafiSays>
      <div className="flex flex-wrap gap-3">
        <Link to={r.next.path} className="rq-btn-primary" data-testid="final-next-btn" onClick={r.next.path === "/final" ? onRetry : undefined}>
          {r.next.label}
        </Link>
        {!r.passed && r.next.path !== "/final" && (
          <button type="button" className="rq-btn-secondary" onClick={onRetry} data-testid="final-retry-btn">
            Try the challenge again
          </button>
        )}
      </div>
    </div>
  );
}

function Year5FinalPage() {
  const { progress, update } = useProgress();
  const { playSound } = useAudio();
  const [phase, setPhase] = useState("intro");
  const [set, setSet] = useState(null);
  const [result, setResult] = useState(null);

  if (!allCoreMastered(progress))
    return (
      <div className="rq-card p-8 max-w-xl space-y-4" data-testid="final-locked">
        <Lock className="text-slate-500" size={36} aria-hidden="true" />
        <h1 className="font-heading text-2xl font-bold text-slate-900">The Final Challenge is locked</h1>
        <p className="text-slate-700">Master all three checkpoints in Learn to open it.</p>
        <Link to="/learn" className="rq-btn-primary" data-testid="final-go-learn-btn">Go to Learn</Link>
      </div>
    );

  const start = () => {
    playSound("levelStart");
    setSet(buildFinalSet());
    setResult(null);
    setPhase("running");
    update((s) => setLastActivity(s, "/final", "Final Challenge"));
  };
  const done = (answers) => {
    const r = finalResult(answers);
    playSound(r.passed ? "achievement" : "levelComplete");
    update((s) => recordFinal(s, r));
    setResult(r);
    setPhase("result");
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="space-y-6" data-testid="final-page">
      <PageTitle title="Final Challenge" subtitle="15 questions: 5 parts to parts, 5 parts to whole, 5 whole to part." testid="final-title" />
      <div className="rq-card p-4 sm:p-6">
        {phase === "intro" && (
          <div className="space-y-5">
            <RafiSays>
              You will see your results at the end. To become a Ratio Master you need 12 out of 15, with at least 4 correct in each type. Take your time — there is no timer.
            </RafiSays>
            {progress.final.attempts > 0 && <p className="text-slate-700" data-testid="final-history">Best score so far: {progress.final.best}/15 · Attempts: {progress.final.attempts}</p>}
            <button type="button" className="rq-btn-primary" onClick={start} data-testid="final-start-btn">
              Start the Final Challenge
            </button>
          </div>
        )}
        {phase === "running" && <QuestionRunner key={set.map((q) => q.id).join()} questions={set} mode="assessment" onDone={done} label="Question" testid="final-runner" />}
        {phase === "result" && <Results r={result} onRetry={start} />}
      </div>
    </div>
  );
}

export default function FinalPage() {
  const { year } = useCourse();
  return year === "year6" ? <Year6Practice assessment /> : <Year5FinalPage />;
}
