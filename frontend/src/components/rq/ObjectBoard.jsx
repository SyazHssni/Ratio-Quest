import { Minus, Plus } from "lucide-react";
import { ObjectToken, TONES } from "./ObjectToken";
import { MAX_COUNT } from "../../lib/ratio";

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const orderBadge = (order, slot) => {
  const i = order ? order.indexOf(slot) : -1;
  if (i < 0) return null;
  return (
    <span className="ml-2 inline-flex items-center rounded-full bg-slate-900 text-white text-xs font-bold px-2 py-0.5" data-testid={`order-badge-${slot}`}>
      {i === 0 ? "1st" : "2nd"}
    </span>
  );
};

const Group = ({ g, highlight, onChange, startNumber, showCounts }) => {
  const tone = TONES[g.tone] || TONES.blue;
  const dim = highlight.focus && !highlight.focus.includes(g.key);
  const focused = highlight.focus && highlight.focus.includes(g.key);
  return (
    <div
      className={`rounded-2xl border-2 ${tone.border} ${tone.bg} p-3 min-w-[140px] flex-1 transition-opacity duration-300 ${dim ? "opacity-40" : ""} ${focused || highlight.order?.includes(g.key) ? "ring-4 ring-amber-300" : ""}`}
      data-testid={`group-${g.key}`}
      role="group"
      aria-label={`${cap(g.plural)}: ${g.count}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className={`font-bold ${tone.text}`}>
          {cap(g.plural)}
          {orderBadge(highlight.order, g.key)}
        </span>
        {showCounts && (
          <span className="ratio-mono text-xl font-bold text-slate-900" data-testid={`count-${g.key}`}>
            {g.count}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1 min-h-[44px]">
        {g.count === 0 && <span className="text-sm text-slate-500 italic">None yet</span>}
        {Array.from({ length: g.count }).map((_, i) => (
          <span key={i} className="rq-enter" style={{ animationDelay: `${i * 30}ms` }}>
            <ObjectToken item={g} number={highlight.countAlong ? startNumber + i : undefined} />
          </span>
        ))}
      </div>
      {onChange && (
        <div className="flex items-center gap-2 mt-3">
          <button type="button" className="rq-btn-secondary !min-h-[44px] !px-3" aria-label={`Remove one ${g.singular}`} disabled={g.count <= 0} onClick={() => onChange(g.key, -1)} data-testid={`minus-${g.key}`}>
            <Minus size={20} />
          </button>
          <button type="button" className="rq-btn-secondary !min-h-[44px] !px-3" aria-label={`Add one ${g.singular}`} disabled={g.count >= MAX_COUNT} onClick={() => onChange(g.key, 1)} data-testid={`plus-${g.key}`}>
            <Plus size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export const ObjectBoard = ({ groups, wholeWord = "items", highlight = {}, onChange, merged = false, showCounts = true, revealWhole = true, testid = "object-board" }) => {
  const whole = groups.reduce((t, g) => t + g.count, 0);
  const wholeOn = highlight.whole || merged;
  let n = 1;
  const starts = groups.map((g) => {
    const s = n;
    n += g.count;
    return s;
  });
  return (
    <div
      className={`rounded-3xl p-3 sm:p-4 transition-colors duration-300 ${wholeOn ? "border-[3px] border-dashed border-teal-600 bg-teal-50/60" : "border-2 border-transparent"}`}
      data-testid={testid}
    >
      {wholeOn && (
        <div className="mb-3 flex items-center font-bold text-teal-900" data-testid="whole-label">
          <span>
            Whole: all the {wholeWord}
            {revealWhole ? ` = ${groups.map((g) => g.count).join(" + ")} = ${whole}` : " — count them all!"}
          </span>
          {orderBadge(highlight.order, "whole")}
        </div>
      )}
      {merged ? (
        <div className="flex flex-wrap gap-1 bg-white rounded-2xl p-3 border-2 border-teal-200" aria-label={`All ${wholeWord}: ${whole}`} role="group" data-testid="merged-view">
          {groups.flatMap((g, gi) => Array.from({ length: g.count }).map((_, i) => <ObjectToken key={`${g.key}-${i}`} item={g} number={highlight.countAlong ? starts[gi] + i : undefined} />))}
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          {groups.map((g, i) => (
            <Group key={g.key} g={g} highlight={highlight} onChange={onChange} startNumber={starts[i]} showCounts={showCounts} />
          ))}
        </div>
      )}
    </div>
  );
};
