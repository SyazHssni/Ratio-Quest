import { useState } from "react";
import { ObjectBoard } from "../rq/ObjectBoard";
import { QuestionCard } from "../rq/QuestionCard";
import { FeedbackPanel } from "../rq/FeedbackPanel";
import { makeGroups } from "../../data/objects";

// Pupil builds a basket to match a target with tap controls, then writes the ratio.
export function BasketRound({ target, question, onComplete }) {
  const [counts, setCounts] = useState([0, 0]);
  const [status, setStatus] = useState("building");
  const [firstTry, setFirstTry] = useState(null);
  const groups = makeGroups("apples", counts[0], counts[1]);
  const change = (key, d) => {
    const i = groups.findIndex((g) => g.key === key);
    setCounts((c) => c.map((v, j) => (j === i ? Math.min(12, Math.max(0, v + d)) : v)));
    if (status === "wrong") setStatus("building");
  };
  const check = () => {
    const ok = counts[0] === target[0] && counts[1] === target[1];
    if (firstTry === null) setFirstTry(ok);
    setStatus(ok ? "ratio" : "wrong");
  };
  if (status === "ratio")
    return (
      <div className="space-y-4" data-testid="basket-step-ratio">
        <p className="rounded-xl bg-green-50 border-2 border-green-400 px-4 py-2 font-semibold text-slate-900" role="status">
          Your basket matches! {target[0]} red apples and {target[1]} green apples.
        </p>
        <QuestionCard question={question} onComplete={(r) => onComplete({ ...r, correct: r.correct && firstTry })} testid="basket-question" />
      </div>
    );
  const diffMsg = [0, 1]
    .map((i) => {
      const g = groups[i];
      if (counts[i] < target[i]) return `You need ${target[i] - counts[i]} more ${g.plural}.`;
      if (counts[i] > target[i]) return `You have ${counts[i] - target[i]} too many ${g.plural}.`;
      return null;
    })
    .filter(Boolean)
    .join(" ");
  return (
    <div className="space-y-4" data-testid="basket-step-build">
      <h2 className="font-heading text-xl sm:text-2xl font-semibold text-slate-900" data-testid="basket-target">
        Create a basket with {target[0]} red apples and {target[1]} green apples.
      </h2>
      <p className="text-slate-700">Tap + to add an apple and − to take one out.</p>
      <ObjectBoard groups={groups} wholeWord="apples" onChange={change} testid="basket-board" />
      <FeedbackPanel status="wrong" fb={status === "wrong" ? { title: "Let's check the basket.", message: diffMsg, guide: "Count each group again." } : null} />
      <button type="button" className="rq-btn-primary" onClick={check} data-testid="check-basket-btn">
        Check my basket
      </button>
    </div>
  );
}
