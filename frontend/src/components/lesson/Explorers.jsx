import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { ObjectBoard } from "../rq/ObjectBoard";
import { RatioDisplay } from "../rq/RatioDisplay";
import { makeGroups, CONTEXTS, shortLabelFor } from "../../data/objects";
import { ratioFor } from "../../lib/ratio";

const slotOf = (ctx, pos) => (pos === "whole" ? "whole" : CONTEXTS[ctx].items[pos === "a" ? 0 : 1]);
const typeLabel = (f, s) => (f === "whole" ? "Whole to part" : s === "whole" ? "Part to whole" : "Parts to parts");

export function CounterExplorer({ ctx = "balls", a = 2, b = 3 }) {
  const [counts, setCounts] = useState([a, b]);
  const groups = makeGroups(ctx, counts[0], counts[1]);
  const whole = CONTEXTS[ctx].whole;
  const change = (key, d) => {
    const i = groups.findIndex((g) => g.key === key);
    setCounts((c) => c.map((v, j) => (j === i ? Math.min(12, Math.max(0, v + d)) : v)));
  };
  const empty = counts[0] + counts[1] === 0;
  return (
    <div className="space-y-4" data-testid="counter-explorer">
      <ObjectBoard groups={groups} wholeWord={whole} onChange={change} highlight={{ order: [groups[0].key, groups[1].key] }} />
      <div className="flex flex-wrap items-center gap-4">
        <RatioDisplay firstLabel={shortLabelFor(groups, groups[0].key, whole)} secondLabel={shortLabelFor(groups, groups[1].key, whole)} value={empty ? null : [counts[0], counts[1]]} testid="explorer-ratio" />
        <button type="button" className="rq-btn-secondary" onClick={() => setCounts([a, b])} data-testid="explorer-reset">
          <RotateCcw size={18} aria-hidden="true" /> Reset
        </button>
      </div>
      <p className="text-lg text-slate-800" data-testid="explorer-sentence" aria-live="polite">
        {empty ? "Add some balls to compare." : `There are ${counts[0]} ${groups[0].plural} compared with ${counts[1]} ${groups[1].plural}.`}
      </p>
      <p className="text-slate-600">Try pressing + and −. Watch the ratio change.</p>
    </div>
  );
}

export function BasketExplorer({ ctx = "fruit", a = 3, b = 2 }) {
  const [view, setView] = useState("separate");
  const [focus, setFocus] = useState("whole");
  const groups = makeGroups(ctx, a, b);
  const whole = CONTEXTS[ctx].whole;
  const highlight = focus === "whole" ? { whole: true } : { focus: [focus] };
  const btn = (on) => `min-h-[48px] px-4 rounded-xl border-2 font-semibold ${on ? "border-teal-600 bg-teal-50 text-teal-900" : "border-slate-200 bg-white text-slate-800"}`;
  return (
    <div className="space-y-4" data-testid="basket-explorer">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a view">
        <button type="button" className={btn(view === "separate")} aria-pressed={view === "separate"} onClick={() => setView("separate")} data-testid="view-separate">
          View A: Separate groups
        </button>
        <button type="button" className={btn(view === "whole")} aria-pressed={view === "whole"} onClick={() => { setView("whole"); setFocus("whole"); }} data-testid="view-whole">
          View B: One whole basket
        </button>
      </div>
      {view === "separate" && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Highlight">
          {groups.map((g) => (
            <button key={g.key} type="button" className={btn(focus === g.key)} aria-pressed={focus === g.key} onClick={() => setFocus(g.key)} data-testid={`focus-${g.key}`}>
              Highlight {g.plural}
            </button>
          ))}
          <button type="button" className={btn(focus === "whole")} aria-pressed={focus === "whole"} onClick={() => setFocus("whole")} data-testid="focus-whole">
            Highlight the whole
          </button>
        </div>
      )}
      <ObjectBoard groups={groups} wholeWord={whole} merged={view === "whole"} highlight={view === "whole" ? { whole: true } : highlight} />
      <p className="text-lg font-semibold text-slate-800" data-testid="basket-summary">
        {groups[0].count} {groups[0].plural} + {groups[1].count} {groups[1].plural} = {a + b} {whole} altogether
      </p>
    </div>
  );
}

export function ComparisonExamples({ ctx, a, b, examples }) {
  const [sel, setSel] = useState(0);
  const groups = makeGroups(ctx, a, b);
  const whole = CONTEXTS[ctx].whole;
  const ex = examples.map((e) => ({ first: slotOf(ctx, e.first), second: slotOf(ctx, e.second) }));
  const cur = ex[sel];
  const involvesWhole = cur.first === "whole" || cur.second === "whole";
  return (
    <div className="space-y-4" data-testid="comparison-examples">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a comparison">
        {ex.map((e, i) => (
          <button
            key={i}
            type="button"
            aria-pressed={sel === i}
            onClick={() => setSel(i)}
            data-testid={`example-${i}`}
            className={`min-h-[48px] px-4 rounded-xl border-2 font-semibold text-left ${sel === i ? "border-teal-600 bg-teal-50 text-teal-900" : "border-slate-200 bg-white text-slate-800"}`}
          >
            <span className="block text-xs uppercase tracking-wide text-slate-600">{typeLabel(e.first, e.second)}</span>
            {shortLabelFor(groups, e.first, whole)} to {shortLabelFor(groups, e.second, whole).toLowerCase()}:{" "}
            <span className="ratio-mono">{ratioFor(groups, e.first, e.second).join(" : ")}</span>
          </button>
        ))}
      </div>
      <ObjectBoard groups={groups} wholeWord={whole} highlight={{ order: [cur.first, cur.second], whole: involvesWhole }} />
      <RatioDisplay firstLabel={shortLabelFor(groups, cur.first, whole)} secondLabel={shortLabelFor(groups, cur.second, whole)} value={ratioFor(groups, cur.first, cur.second)} testid="example-ratio" />
    </div>
  );
}
