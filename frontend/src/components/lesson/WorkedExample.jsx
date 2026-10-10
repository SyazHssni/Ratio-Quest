import { useState } from "react";
import { ObjectBoard } from "../rq/ObjectBoard";
import { RatioDisplay } from "../rq/RatioDisplay";
import { shortLabelFor } from "../../data/objects";
import { slotValue } from "../../lib/ratio";

export function WorkedExample({ q, onDone }) {
  const involvesWhole = q.first === "whole" || q.second === "whole";
  const label = (slot) => (slot === "whole" ? `all the ${q.wholeWord}` : q.groups.find((g) => g.key === slot).plural);
  const steps = [
    ...(involvesWhole ? [{ text: `Find the whole: ${q.groups.map((g) => g.count).join(" + ")} = ${slotValue(q.groups, "whole")} ${q.wholeWord}.`, hl: { whole: true } }] : []),
    { text: `The question says ${label(q.first)} first. Count them: ${slotValue(q.groups, q.first)}.`, hl: { order: [q.first], whole: q.first === "whole" } },
    { text: `Then ${label(q.second)}. Count them: ${slotValue(q.groups, q.second)}.`, hl: { order: [q.first, q.second], whole: involvesWhole } },
    { text: `So the ratio of ${label(q.first)} to ${label(q.second)} is ${q.correctAnswer.join(" : ")}.`, hl: { order: [q.first, q.second], whole: involvesWhole }, ratio: true },
  ];
  const [shown, setShown] = useState(1);
  const cur = steps[shown - 1];
  return (
    <div className="space-y-5" data-testid="worked-example-step">
      <h2 className="font-heading text-xl sm:text-2xl font-semibold text-slate-900">{q.prompt}</h2>
      <ObjectBoard groups={q.groups} wholeWord={q.wholeWord} highlight={cur.hl} />
      <ol className="space-y-2" aria-live="polite">
        {steps.slice(0, shown).map((s, i) => (
          <li key={i} className="rq-enter flex gap-3 items-start rounded-xl bg-sky-50 border border-sky-200 px-4 py-3 text-slate-900 text-lg" data-testid={`worked-step-${i}`}>
            <span className="font-bold bg-slate-900 text-white rounded-full w-7 h-7 flex items-center justify-center shrink-0 text-sm">{i + 1}</span>
            {s.text}
          </li>
        ))}
      </ol>
      {cur.ratio && <RatioDisplay firstLabel={shortLabelFor(q.groups, q.first, q.wholeWord)} secondLabel={shortLabelFor(q.groups, q.second, q.wholeWord)} value={q.correctAnswer} />}
      <div>
        {shown < steps.length ? (
          <button type="button" className="rq-btn-primary" onClick={() => setShown(shown + 1)} data-testid="worked-next-btn">
            Show next step
          </button>
        ) : (
          <button type="button" className="rq-btn-primary" onClick={onDone} data-testid="continue-btn">
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
