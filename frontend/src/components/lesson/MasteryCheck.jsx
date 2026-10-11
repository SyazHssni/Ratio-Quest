import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { QuestionRunner } from "../rq/QuestionRunner";
import { RafiSays } from "../rq/Rafi";
import { buildMasterySet, lessonMasteryResult, TYPE_NAMES } from "../../lib/mastery";
import { useProgress } from "../../context/ProgressContext";
import { recordMastery } from "../../lib/progress";
import { useAudio } from "../../audio/AudioContext";

function OrderReview({ onDone }) {
  return (
    <div className="rounded-2xl bg-sky-50 border-2 border-sky-200 p-5 space-y-3" data-testid="order-review">
      <h3 className="font-heading text-xl font-semibold text-slate-900">Quick review: the order matters</h3>
      <p className="text-slate-800">Read the question. The thing named FIRST gives the first number. The thing named SECOND gives the second number.</p>
      <div className="flex flex-wrap items-center gap-3 text-lg font-semibold">
        <span className="rounded-xl bg-white border-2 border-slate-300 px-3 py-2">"🍎 <strong>to</strong> 🍌"</span>
        <ArrowRight aria-hidden="true" />
        <span className="rounded-xl bg-white border-2 border-slate-300 px-3 py-2">Apples first, then bananas</span>
        <ArrowRight aria-hidden="true" />
        <span className="ratio-mono rounded-xl bg-white border-2 border-teal-500 px-3 py-2">2 : 3</span>
      </div>
      <p className="text-slate-800">"Bananas to apples" swaps them: <span className="ratio-mono font-bold">3 : 2</span>. Same fruits, different question, different ratio.</p>
      <button type="button" className="rq-btn-primary" onClick={onDone} data-testid="order-review-done">
        I've got it
      </button>
    </div>
  );
}

export function MasteryCheck({ type, onPassed, onReviewWorked }) {
  const { update } = useProgress();
  const { playSound } = useAudio();
  const [phase, setPhase] = useState("intro");
  const [set, setSet] = useState(null);
  const [result, setResult] = useState(null);
  const [reviewDone, setReviewDone] = useState(false);

  const start = () => {
    playSound("levelStart");
    setSet(buildMasterySet(type));
    setResult(null);
    setReviewDone(false);
    setPhase("running");
  };
  const done = (answers) => {
    const r = lessonMasteryResult(type, answers);
    playSound(r.passed ? "achievement" : "levelComplete");
    update((s) => recordMastery(s, type, r));
    setResult(r);
    setPhase("result");
  };

  if (phase === "intro")
    return (
      <div className="space-y-5" data-testid="mastery-intro">
        <RafiSays>Time for a mastery check! Answer 5 questions on {TYPE_NAMES[type]}. You need 4 correct. You can try again as many times as you like.</RafiSays>
        <button type="button" className="rq-btn-primary" onClick={start} data-testid="mastery-start-btn">
          Start mastery check
        </button>
      </div>
    );
  if (phase === "running") return <QuestionRunner key={set.map((q) => q.id).join()} questions={set} mode="mastery" onDone={done} label="Mastery question" testid="mastery-runner" />;

  const needReview = result.needsOrderReview && !reviewDone;
  return (
    <div className="rq-summary-enter space-y-5" data-testid="mastery-result" aria-live="polite">
      <p className="font-heading text-2xl font-semibold text-slate-900" data-testid="mastery-score">
        You scored {result.score} out of {result.total}.
      </p>
      {result.passed ? (
        <>
          <RafiSays>Brilliant! You have mastered {TYPE_NAMES[type]}.</RafiSays>
          <button type="button" className="rq-btn-primary" onClick={onPassed} data-testid="mastery-continue-btn">
            Continue
          </button>
        </>
      ) : (
        <>
          <RafiSays mood="thinking">
            Good effort! You need 4 out of 5{result.ruleOk ? "" : `, and to ${result.ruleText.toLowerCase()}`}. Let's practise a little and try again.
          </RafiSays>
          {needReview ? (
            <OrderReview onDone={() => setReviewDone(true)} />
          ) : (
            <div className="flex flex-wrap gap-3">
              <button type="button" className="rq-btn-primary" onClick={start} data-testid="mastery-retry-btn">
                Try the check again
              </button>
              <button type="button" className="rq-btn-secondary" onClick={onReviewWorked} data-testid="mastery-review-btn">
                Look at the worked example again
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
