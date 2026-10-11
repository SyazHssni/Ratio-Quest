import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Lock } from "lucide-react";
import { PageTitle } from "../components/rq/AppShell";
import { QuestionRunner } from "../components/rq/QuestionRunner";
import { RafiSays } from "../components/rq/Rafi";
import { useProgress } from "../context/ProgressContext";
import { isLessonUnlocked, allCoreMastered, setLastActivity, recordPracticeSession } from "../lib/progress";
import { questionsFor, QUESTION_BANK } from "../data/questionBank";
import { selectPracticeQuestions } from "../lib/random";
import { TYPE_NAMES } from "../lib/mastery";
import { useAudio } from "../audio/AudioContext";
import { useCourse } from "../context/CourseContext";
import { Year6Practice } from "./Year6Activities";

const TOPICS = [...Object.entries(TYPE_NAMES).map(([id, name]) => ({ id, name })), { id: "mixed", name: "Mixed Practice" }];
const LEVELS = ["all", "easy", "medium", "challenging"];

function Year5PracticePage() {
  const { progress, update } = useProgress();
  const { playSound } = useAudio();
  const [params, setParams] = useSearchParams();
  const [level, setLevel] = useState("all");
  const [session, setSession] = useState(null);
  const [summary, setSummary] = useState(null);
  const topic = TOPICS.some((t) => t.id === params.get("topic")) ? params.get("topic") : "p2p";
  const unlocked = (id) => (id === "mixed" ? allCoreMastered(progress) : isLessonUnlocked(progress, id));

  const start = () => {
    playSound("levelStart");
    const pool = (topic === "mixed" ? QUESTION_BANK : questionsFor(topic)).filter((q) => level === "all" || q.difficulty === level);
    const id = Date.now();
    const questions = selectPracticeQuestions(pool, Math.min(6, pool.length), id, progress.practice.recentQuestionIds || []);
    setSession({ id, questions });
    setSummary(null);
    update((s) => setLastActivity(recordPracticeSession(s, questions.map((q) => q.id)), `/practice?topic=${topic}`, `Practice: ${TOPICS.find((t) => t.id === topic).name}`));
  };
  const done = (results) => {
    playSound("levelComplete");
    setSummary({ firstTry: results.filter((r) => r.correct).length, total: results.length });
    setSession(null);
  };

  return (
    <div className="space-y-6" data-testid="practice-page">
      <PageTitle title="Practice" subtitle="Pick a topic. Every question gives you help if you need it." testid="practice-title" />
      {!session && (
        <div className="rq-card p-4 sm:p-6 space-y-5">
          <div role="radiogroup" aria-label="Topic" className="flex flex-wrap gap-2">
            {TOPICS.map((t) => {
              const open = unlocked(t.id);
              return (
                <button key={t.id} type="button" role="radio" aria-checked={topic === t.id} disabled={!open} onClick={() => setParams({ topic: t.id })} data-testid={`topic-${t.id}`}
                  className={`min-h-[48px] px-4 rounded-xl border-2 font-semibold inline-flex items-center gap-2 ${topic === t.id ? "border-teal-600 bg-teal-600 text-white" : "border-slate-200 bg-white text-slate-800"} disabled:opacity-50 disabled:cursor-not-allowed`}>
                  {!open && <Lock size={16} aria-hidden="true" />} {t.name}
                </button>
              );
            })}
          </div>
          <div role="radiogroup" aria-label="Difficulty" className="flex flex-wrap gap-2">
            {LEVELS.map((l) => (
              <button key={l} type="button" role="radio" aria-checked={level === l} onClick={() => setLevel(l)} data-testid={`level-${l}`}
                className={`min-h-[44px] px-3 rounded-xl border-2 text-sm font-semibold capitalize ${level === l ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-800"}`}>
                {l === "all" ? "All levels" : l}
              </button>
            ))}
          </div>
          {unlocked(topic) ? (
            <button type="button" className="rq-btn-primary" onClick={start} data-testid="practice-start-btn">
              Start practice
            </button>
          ) : (
            <p className="text-slate-700" data-testid="practice-locked">
              This topic opens after you master the lesson before it. <Link to="/learn" className="underline font-semibold text-teal-800">Go to Learn</Link>
            </p>
          )}
          {summary && (
            <div className="rq-summary-enter">
              <RafiSays testid="practice-summary">
                You finished! {summary.firstTry} of {summary.total} correct on the first try. Every question you fixed after a hint counts too. Want another round?
              </RafiSays>
            </div>
          )}
        </div>
      )}
      {session && (
        <div className="rq-card p-4 sm:p-6">
          <QuestionRunner key={session.id} questions={session.questions} onDone={done} label="Practice question" testid="practice-runner" />
        </div>
      )}
    </div>
  );
}

export default function PracticePage() {
  const { year } = useCourse();
  return year === "year6" ? <Year6Practice /> : <Year5PracticePage />;
}
