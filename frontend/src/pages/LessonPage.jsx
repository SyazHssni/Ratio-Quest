import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Target, Lock, Trophy } from "lucide-react";
import { LESSONS, LESSON_ORDER, independentQuestion, workedQuestion } from "../data/lessons";
import { useProgress } from "../context/ProgressContext";
import { setLessonStep, setLastActivity, markTaught, isLessonUnlocked, allCoreMastered } from "../lib/progress";
import { StepProgress } from "../components/rq/RatioDisplay";
import { RafiSays } from "../components/rq/Rafi";
import { QuestionRunner } from "../components/rq/QuestionRunner";
import { CounterExplorer, BasketExplorer, ComparisonExamples } from "../components/lesson/Explorers";
import { WorkedExample } from "../components/lesson/WorkedExample";
import { MasteryCheck } from "../components/lesson/MasteryCheck";
import NotFoundPage from "./NotFoundPage";

const STEPS = ["Goal", "Explore", "Learn", "Worked example", "Guided activity", "Your turn", "Mastery check", "Complete"];
const TOTAL = STEPS.length;

const Explore = ({ lesson }) => {
  if (lesson.id === "p2p") return <CounterExplorer ctx="balls" a={2} b={3} />;
  if (lesson.id === "p2w") return <BasketExplorer ctx="fruit" a={3} b={2} />;
  return <ComparisonExamples ctx="fruit" a={3} b={2} examples={[{ first: "a", second: "b" }, { first: "a", second: "whole" }, { first: "whole", second: "a" }]} />;
};

function LessonBody({ lesson, step, go }) {
  const [checksDone, setChecksDone] = useState(false);
  const checks = useMemo(() => lesson.checks(), [lesson]);
  const guided = useMemo(() => lesson.guided(), [lesson]);
  const indep = useMemo(() => independentQuestion(lesson.id), [lesson]);
  const worked = useMemo(() => workedQuestion(lesson), [lesson]);
  const next = () => go(step + 1);
  const primary = (label = "Continue", disabled = false) => (
    <button type="button" className="rq-btn-primary" onClick={next} disabled={disabled} data-testid="lesson-continue-btn">
      {label}
    </button>
  );

  switch (step) {
    case 0:
      return (
        <div className="space-y-6" data-testid="step-goal">
          <div className="flex items-start gap-3 rounded-2xl bg-teal-50 border-2 border-teal-200 p-5">
            <Target className="text-teal-700 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-teal-800">Learning goal</p>
              <p className="text-lg sm:text-xl font-semibold text-slate-900" data-testid="lesson-goal">{lesson.goal}</p>
            </div>
          </div>
          <RafiSays>Welcome to {lesson.zone}! Let's explore together.</RafiSays>
          {primary("Start lesson")}
        </div>
      );
    case 1:
      return (
        <div className="space-y-6" data-testid="step-explore">
          <RafiSays>{lesson.story}</RafiSays>
          <Explore lesson={lesson} />
          {primary()}
        </div>
      );
    case 2:
      return (
        <div className="space-y-6" data-testid="step-explain">
          <div className="space-y-2 max-w-3xl">
            {lesson.explain.map((p) => (
              <p key={p} className="text-lg text-slate-800 leading-relaxed">{p}</p>
            ))}
          </div>
          <ComparisonExamples {...lesson.examplesCtx} examples={lesson.examples} />
          <div className="rounded-3xl border-2 border-slate-200 p-4 sm:p-6 bg-slate-50">
            {checksDone ? (
              <div className="space-y-4">
                <RafiSays>Great thinking! Now let's see a worked example.</RafiSays>
                {primary()}
              </div>
            ) : (
              <QuestionRunner questions={checks} onDone={() => setChecksDone(true)} label="Quick check" testid="explain-checks" />
            )}
          </div>
        </div>
      );
    case 3:
      return <WorkedExample q={worked} onDone={next} />;
    case 4:
      return (
        <div className="space-y-4" data-testid="step-guided">
          <RafiSays>Let's do this one together. The hint is already open to help you.</RafiSays>
          <QuestionRunner questions={guided} onDone={next} hintFirst label="Guided question" testid="guided-runner" />
        </div>
      );
    case 5:
      return (
        <div className="space-y-4" data-testid="step-independent">
          <RafiSays>Your turn! Try this one on your own.</RafiSays>
          <QuestionRunner questions={indep} onDone={next} label="Your question" testid="independent-runner" />
        </div>
      );
    case 6:
      return <MasteryCheck type={lesson.id} onPassed={next} onReviewWorked={() => go(3)} />;
    default:
      return null;
  }
}

function Complete({ lesson }) {
  const { progress } = useProgress();
  const idx = LESSON_ORDER.indexOf(lesson.id);
  const nextId = LESSON_ORDER[idx + 1];
  const allDone = allCoreMastered(progress);
  return (
    <div className="space-y-6 text-left" data-testid="step-complete">
      <div className="flex items-center gap-4">
        <Trophy size={56} className="text-amber-500" aria-hidden="true" />
        <div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">Lesson {lesson.number} complete!</h2>
          <p className="text-slate-700 text-lg">You have mastered {lesson.title}. Points so far: {progress.points}.</p>
        </div>
      </div>
      {nextId ? (
        <Link to={`/learn/${nextId}`} className="rq-btn-primary" data-testid="next-lesson-btn">
          Start Lesson {idx + 2}: {LESSONS[nextId].title}
        </Link>
      ) : allDone ? (
        <Link to="/final" className="rq-btn-primary" data-testid="go-final-btn">
          Take the Final Challenge
        </Link>
      ) : (
        <Link to="/learn" className="rq-btn-primary" data-testid="back-journey-btn">
          Back to my journey
        </Link>
      )}
    </div>
  );
}

export default function LessonPage() {
  const { lessonId } = useParams();
  const lesson = LESSONS[lessonId];
  const { progress, update } = useProgress();
  const navigate = useNavigate();
  const saved = lesson ? progress.lessons[lesson.id] : null;
  const [step, setStep] = useState(() => {
    if (!saved) return 0;
    return saved.step >= TOTAL - 1 && !saved.mastered ? TOTAL - 2 : Math.min(saved.step, TOTAL - 1);
  });
  const [resumedAt] = useState(step);

  useEffect(() => {
    if (!lesson) return;
    update((s) => setLastActivity(setLessonStep(s, lesson.id, step), `/learn/${lesson.id}`, `Lesson ${lesson.number}: ${lesson.title}`));
    if (step >= 6) update((s) => markTaught(s, lesson.id));
    window.scrollTo({ top: 0 });
  }, [step, lesson, update]);

  if (!lesson) return <NotFoundPage />;
  if (!isLessonUnlocked(progress, lesson.id)) {
    const prev = LESSONS[LESSON_ORDER[LESSON_ORDER.indexOf(lesson.id) - 1]];
    return (
      <div className="rq-card p-8 max-w-xl space-y-4" data-testid="lesson-locked">
        <Lock className="text-slate-500" size={36} aria-hidden="true" />
        <h1 className="font-heading text-2xl font-bold text-slate-900">Lesson {lesson.number} is waiting for you</h1>
        <p className="text-slate-700">Pass the mastery check in Lesson {prev.number}: {prev.title} to open this lesson.</p>
        <Link to={`/learn/${prev.id}`} className="rq-btn-primary" data-testid="go-prev-lesson-btn">
          Go to Lesson {prev.number}
        </Link>
      </div>
    );
  }

  const go = (n) => setStep(Math.max(0, Math.min(TOTAL - 1, n)));
  return (
    <div className="space-y-5" data-testid={`lesson-${lesson.id}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" className="rq-btn-secondary !min-h-[44px]" onClick={() => (step === 0 ? navigate("/learn") : go(step - 1))} data-testid="lesson-back-btn">
          <ArrowLeft size={18} aria-hidden="true" /> Back
        </button>
        <StepProgress step={step + 1} total={TOTAL} />
      </div>
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-slate-600">
          Lesson {lesson.number} · {STEPS[step]}
        </p>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900" data-testid="lesson-title">{lesson.title}</h1>
      </div>
      {resumedAt > 1 && step === resumedAt && (
        <button type="button" className="text-sm font-semibold text-teal-800 underline min-h-[32px]" onClick={() => go(0)} data-testid="restart-lesson-btn">
          Start this lesson from the beginning
        </button>
      )}
      <div className="rq-card rq-question-enter p-4 sm:p-8 bg-sky-50/40" key={step}>
        {step === TOTAL - 1 ? <Complete lesson={lesson} /> : <LessonBody lesson={lesson} step={step} go={go} />}
      </div>
    </div>
  );
}
