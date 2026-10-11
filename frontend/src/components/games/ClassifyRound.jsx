import { useState } from "react";
import { ObjectBoard } from "../rq/ObjectBoard";
import { QuestionCard } from "../rq/QuestionCard";
import { FeedbackPanel } from "../rq/FeedbackPanel";
import { TYPE_NAMES } from "../../lib/mastery";

const why = {
  p2p: "Both quantities are groups, so this is parts to parts.",
  p2w: "One group comes first, then ALL the items. That is part to whole.",
  w2p: "ALL the items come first, then one group. That is whole to part.",
};

// Step 1: classify the comparison. Step 2: build the ratio.
export function ClassifyRound({ question, onComplete }) {
  const [choice, setChoice] = useState(null);
  const [status, setStatus] = useState("answering");
  const [firstCorrect, setFirstCorrect] = useState(null);
  const check = () => {
    const ok = choice === question.comparisonType;
    if (firstCorrect === null) setFirstCorrect(ok);
    setStatus(ok ? "built" : "wrong");
  };
  if (status === "built")
    return (
      <div className="space-y-4" data-testid="classify-step-build">
        <p className="rounded-xl bg-green-50 border-2 border-green-400 px-4 py-2 font-semibold text-slate-900" role="status">
          Yes — {TYPE_NAMES[question.comparisonType]}. {why[question.comparisonType]} Now build the ratio.
        </p>
        <QuestionCard question={{ ...question, kind: "build", showVisual: question.showVisual !== false }} onComplete={(r) => onComplete({ ...r, correct: r.correct && firstCorrect })} testid="classify-build" />
      </div>
    );
  return (
    <div className="space-y-4" data-testid="classify-step-type">
      <h2 className="font-heading text-xl sm:text-2xl font-semibold text-slate-900" data-testid="classify-prompt">{question.prompt}</h2>
      {question.showVisual !== false && <ObjectBoard groups={question.groups} wholeWord={question.wholeWord} />}
      <p className="font-semibold text-slate-800">What kind of comparison is this?</p>
      <div role="radiogroup" aria-label="Comparison type" className="grid sm:grid-cols-3 gap-3">
        {Object.entries(TYPE_NAMES).map(([k, n]) => (
          <button key={k} type="button" role="radio" aria-checked={choice === k} disabled={status === "wrong"} onClick={() => setChoice(k)} data-testid={`classify-${k}`}
            className={`min-h-[56px] rounded-2xl border-2 font-bold ${choice === k ? "border-teal-600 bg-teal-50 ring-2 ring-teal-600" : "border-slate-200 bg-white"}`}>
            {n}
          </button>
        ))}
      </div>
      <FeedbackPanel status="wrong" fb={status === "wrong" ? { title: "Let's read the question again.", message: "Look at the two things after 'the ratio of'. Is each one a group, or is one of them ALL the items?", guide: `Which comes first: ${question.firstQuantityLabel}. Which comes second: ${question.secondQuantityLabel}.` } : null} />
      {status === "wrong" ? (
        <button type="button" className="rq-btn-primary" onClick={() => { setStatus("answering"); setChoice(null); }} data-testid="try-again-btn">Try again</button>
      ) : (
        <button type="button" className="rq-btn-primary" disabled={!choice} onClick={check} data-testid="check-answer-btn">Check answer</button>
      )}
    </div>
  );
}
