import { Link } from "react-router-dom";
import { Lock, ArrowRight } from "lucide-react";
import { useProgress } from "../context/ProgressContext";
import { isLessonUnlocked, allCoreMastered } from "../lib/progress";
import { LESSONS, LESSON_ORDER } from "../data/lessons";
import { PageTitle } from "../components/rq/AppShell";
import { JourneyStatus } from "./HomePage";
import { useCourse } from "../context/CourseContext";
import Year6Page from "./Year6Page";

const UNLOCKS = [
  { to: "/practice?topic=mixed", title: "Mixed Practice", desc: "All three types, mixed together.", id: "mixed" },
  { to: "/games/detective", title: "Ratio Detective", desc: "Spot the ratio that answers the question.", id: "detective" },
  { to: "/final", title: "Final Challenge", desc: "15 questions to become a Ratio Master.", id: "final" },
];

export default function LearnPage() {
  const { year } = useCourse();
  const { progress } = useProgress();
  if (year === "year6") return <Year6Page />;
  const allDone = allCoreMastered(progress);
  return (
    <div className="space-y-8" data-testid="learn-page">
      <PageTitle title="Learn" subtitle="Three checkpoints. Master each one to open the next. You can revisit any lesson you have opened." testid="learn-title" />
      <ol className="space-y-4">
        {LESSON_ORDER.map((id) => {
          const l = LESSONS[id];
          const open = isLessonUnlocked(progress, id);
          const p = progress.lessons[id];
          return (
            <li key={id} className="rq-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4" data-testid={`learn-card-${id}`}>
              <div className="flex items-start gap-4">
                <span className="font-heading text-3xl font-bold text-teal-700 w-12 h-12 rounded-2xl bg-teal-50 border-2 border-teal-200 flex items-center justify-center shrink-0">{l.number}</span>
                <div>
                  <p className="text-sm font-bold text-slate-600">Checkpoint {l.number} · {l.zone}</p>
                  <h2 className="font-heading text-xl sm:text-2xl font-semibold text-slate-900">{l.title}</h2>
                  <p className="text-slate-700">{l.goal}</p>
                  <div className="mt-1 flex flex-wrap gap-3 items-center">
                    <JourneyStatus id={id} />
                    {p.bestScore !== null && <span className="text-sm text-slate-600">Best mastery score: {p.bestScore}/5</span>}
                  </div>
                </div>
              </div>
              {open ? (
                <Link to={`/learn/${id}`} className={p.mastered ? "rq-btn-secondary" : "rq-btn-primary"} data-testid={`open-lesson-${id}`}>
                  {p.mastered ? "Revisit" : p.step > 0 ? "Continue" : "Start"} <ArrowRight size={18} aria-hidden="true" />
                </Link>
              ) : (
                <span className="inline-flex items-center gap-2 text-slate-600 font-semibold" data-testid={`locked-lesson-${id}`}>
                  <Lock size={18} aria-hidden="true" /> Master Lesson {l.number - 1} first
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <section aria-labelledby="after-heading" className="space-y-3">
        <h2 id="after-heading" className="font-heading text-2xl font-bold text-slate-900">After the three checkpoints</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {UNLOCKS.map((u) =>
            allDone ? (
              <Link key={u.id} to={u.to} className="rq-card p-5 hover:border-teal-500 transition-colors" data-testid={`unlock-${u.id}`}>
                <p className="font-heading text-lg font-semibold text-slate-900">{u.title}</p>
                <p className="text-slate-700 text-sm">{u.desc}</p>
              </Link>
            ) : (
              <div key={u.id} className="rq-card p-5 opacity-70" data-testid={`unlock-${u.id}-locked`}>
                <p className="font-heading text-lg font-semibold text-slate-900 flex items-center gap-2"><Lock size={16} aria-hidden="true" /> {u.title}</p>
                <p className="text-slate-700 text-sm">Opens after you master all three checkpoints.</p>
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
}
