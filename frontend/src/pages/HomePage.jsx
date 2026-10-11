import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Lock, Play } from "lucide-react";
import { useProgress } from "../context/ProgressContext";
import { hasAnyProgress, isLessonUnlocked } from "../lib/progress";
import { LESSONS, LESSON_ORDER } from "../data/lessons";
import { ObjectBoard } from "../components/rq/ObjectBoard";
import { RafiAvatar } from "../components/rq/Rafi";
import { makeGroups } from "../data/objects";
import { ratioFor } from "../lib/ratio";
import { useCourse } from "../context/CourseContext";

export const JourneyStatus = ({ id }) => {
  const { progress } = useProgress();
  const l = progress.lessons[id];
  if (l.mastered) return <span className="inline-flex items-center gap-1 text-green-800 font-semibold text-sm"><CheckCircle2 size={16} aria-hidden="true" /> Mastered</span>;
  if (!isLessonUnlocked(progress, id)) return <span className="inline-flex items-center gap-1 text-slate-600 font-semibold text-sm"><Lock size={16} aria-hidden="true" /> Locked</span>;
  return <span className="inline-flex items-center gap-1 text-teal-800 font-semibold text-sm"><Play size={16} aria-hidden="true" /> {l.step > 0 ? "In progress" : "Ready"}</span>;
};

export default function HomePage() {
  const { progress, year6Progress } = useProgress();
  const { setYear, year } = useCourse();
  const returning = hasAnyProgress(progress);
  const mastered = LESSON_ORDER.filter((id) => progress.lessons[id].mastered).length;
  const firstOpen = LESSON_ORDER.find((id) => !progress.lessons[id].mastered && isLessonUnlocked(progress, id)) || "p2p";
  const demoGroups = makeGroups("fruit", 2, 3);
  const apple = demoGroups[0].key;
  const banana = demoGroups[1].key;
  const comparisons = [
    ["Apples to bananas", apple, banana],
    ["Apples to all fruits", apple, "whole"],
    ["All fruits to bananas", "whole", banana],
  ];
  return (
    <div className="space-y-10" data-testid="home-page">
      <section aria-labelledby="course-choice" className="space-y-4">
        <div><p className="text-sm font-bold uppercase tracking-wide text-teal-800">Choose your course</p><h2 id="course-choice" className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">Which year are you learning?</h2></div>
        <div className="grid md:grid-cols-2 gap-4">
          <Link to="/learn?year=5" onClick={() => setYear("year5")} className="rq-card p-5 sm:p-6 border-2 border-amber-300 hover:border-amber-500 transition-colors"><p className="text-sm font-bold text-amber-900">Year 5 — Ratio</p><h3 className="font-heading text-xl font-bold mt-1">Learn to compare quantities and represent ratios involving parts and wholes.</h3><span className="inline-flex mt-4 items-center gap-2 font-semibold text-teal-800">Enter Year 5 Courses <ArrowRight size={18} /></span></Link>
          <Link to="/learn?year=6" onClick={() => setYear("year6")} className="rq-card p-5 sm:p-6 border-2 border-indigo-200 hover:border-indigo-400 transition-colors"><p className="text-sm font-bold text-indigo-900">Year 6 — Ratio and Proportion</p><h3 className="font-heading text-xl font-bold mt-1">Learn to simplify ratios, understand equivalent relationships, and determine proportionate quantities.</h3><span className="inline-flex mt-4 items-center gap-2 font-semibold text-teal-800">Enter Year 6 Courses <ArrowRight size={18} /></span></Link>
        </div>
      </section>
      {year === "year6" ? <section className="rq-card p-6 sm:p-8 space-y-4" data-course="year6">
        <p className="inline-flex rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-sm font-bold">Year 6 Maths · Ratio and Proportion</p>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold" data-testid="home-title">Welcome to Ratio Quest!</h1>
        <p className="text-lg text-slate-700 max-w-2xl">Explore simplest-form ratios, equivalent groups, and proportionate quantities in your Year 6 learning journey.</p>
        <p className="font-semibold text-slate-700">Year 6 lessons completed: {Object.values(year6Progress.done || {}).filter(Boolean).length}/8</p>
        <Link to="/learn?year=6" className="rq-btn-primary">Continue Year 6 learning <ArrowRight size={20} /></Link>
      </section> : <>
      <section className="grid lg:grid-cols-[1.1fr_1fr] gap-8 items-center">
        <div className="space-y-5 rq-enter">
          <p className="inline-flex items-center gap-2 rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-sm font-bold text-slate-900">Year 5 Maths · Ratio</p>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight" data-testid="home-title">
            Welcome to Ratio Quest!
          </h1>
          <p className="text-lg md:text-xl text-slate-700 max-w-xl">Learn to compare groups and discover three ways to write ratios.</p>
          <div className="flex flex-wrap items-center gap-4">
            {returning && progress.lastActivity ? (
              <Link to={progress.lastActivity.path} className="rq-btn-primary" data-testid="continue-learning-btn">
                Continue where I left off <ArrowRight size={20} aria-hidden="true" />
              </Link>
            ) : (
              <Link to="/learn/p2p" className="rq-btn-primary" data-testid="start-learning-btn">
                Start Learning <ArrowRight size={20} aria-hidden="true" />
              </Link>
            )}
          </div>
          {returning && progress.lastActivity && <p className="text-sm text-slate-600" data-testid="last-activity">Last time: {progress.lastActivity.label}</p>}
          <div className="max-w-sm" data-testid="home-progress">
            <div className="flex justify-between text-sm font-semibold text-slate-700 mb-1">
              <span>My journey</span>
              <span>{mastered} of 3 checkpoints mastered</span>
            </div>
            <div className="h-3 rounded-full bg-slate-200 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={3} aria-valuenow={mastered} aria-label="Checkpoints mastered">
              <div className="h-full bg-teal-600 transition-[width] duration-500" style={{ width: `${(mastered / 3) * 100}%` }} />
            </div>
          </div>
        </div>
        <div className="rq-card p-5 sm:p-6 space-y-4 rq-enter" style={{ animationDelay: "120ms" }}>
          <div className="flex items-center gap-3">
            <RafiAvatar size={52} />
            <p className="font-semibold text-slate-800">One basket, three useful comparisons. Each emoji stands for one fruit.</p>
          </div>
          <ObjectBoard groups={demoGroups} wholeWord="fruits" testid="home-board" />
          <div className="grid sm:grid-cols-3 gap-2" aria-label="Three ratios from the same fruit basket">
            {comparisons.map(([label, first, second]) => <div key={label} className="rounded-xl border border-slate-200 p-3"><p className="text-sm font-semibold text-slate-700">{label}</p><p className="ratio-mono text-xl font-bold text-teal-800">{ratioFor(demoGroups, first, second).join(" : ")}</p></div>)}
          </div>
        </div>
      </section>

      <section aria-labelledby="journey-heading" className="space-y-4">
        <h2 id="journey-heading" className="font-heading text-2xl font-bold text-slate-900">Your journey</h2>
        <ol className="grid sm:grid-cols-3 gap-4">
          {LESSON_ORDER.map((id, i) => (
            <li key={id} className={`rq-card p-5 rq-enter ${id === firstOpen ? "ring-2 ring-teal-500" : ""}`} style={{ animationDelay: `${i * 80}ms` }} data-testid={`journey-${id}`}>
              <p className="text-sm font-bold text-slate-600">Checkpoint {i + 1} · {LESSONS[id].zone}</p>
              <p className="font-heading text-xl font-semibold text-slate-900 mt-1">{LESSONS[id].title}</p>
              <div className="mt-2"><JourneyStatus id={id} /></div>
            </li>
          ))}
        </ol>
      </section>
      </>}
    </div>
  );
}
