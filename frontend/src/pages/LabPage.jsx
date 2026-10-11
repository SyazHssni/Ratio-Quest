import { useState } from "react";
import { RotateCcw, Hammer, CheckCircle2 } from "lucide-react";
import { ObjectBoard } from "../components/rq/ObjectBoard";
import { RatioDisplay } from "../components/rq/RatioDisplay";
import { QuestionCard } from "../components/rq/QuestionCard";
import { PageTitle } from "../components/rq/AppShell";
import { EMOJI_LIBRARY, ITEMS } from "../data/objects";
import { ratioFor, MAX_COUNT } from "../lib/ratio";
import { pickRandom } from "../lib/random";
import { useProgress } from "../context/ProgressContext";
import { recordLab, setLastActivity } from "../lib/progress";
import { TYPE_NAMES } from "../lib/mastery";
import { useCourse } from "../context/CourseContext";
import { Year6VisualLab } from "./Year6Activities";

const START = { apple: 2, banana: 3 };
const noun = (g, n) => (n === 1 ? g.singular : g.plural);

export function ComparisonSelector({ value, onChange }) {
  return (
    <div role="radiogroup" aria-label="Comparison type" className="flex flex-wrap gap-2" data-testid="comparison-selector">
      {Object.entries(TYPE_NAMES).map(([k, label]) => (
        <button
          key={k}
          type="button"
          role="radio"
          aria-checked={value === k}
          onClick={() => onChange(k)}
          data-testid={`compare-${k}`}
          className={`min-h-[48px] px-4 rounded-xl border-2 font-semibold ${value === k ? "border-teal-600 bg-teal-600 text-white" : "border-slate-200 bg-white text-slate-800 hover:border-teal-400"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

const Picker = ({ label, value, options, onChange, testid, groups }) => (
  <div className="space-y-1">
    <p className="text-sm font-bold text-slate-700">{label}</p>
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
      {options.map((k) => (
        <button key={k} type="button" role="radio" aria-checked={value === k} onClick={() => onChange(k)} data-testid={`${testid}-${k}`}
          className={`min-h-[44px] px-3 rounded-xl border-2 text-sm font-semibold ${value === k ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-800"}`}>
          {groups.find((g) => g.key === k).short}
        </button>
      ))}
    </div>
  </div>
);

function Year5LabPage() {
  const { progress, update } = useProgress();
  const [counts, setCounts] = useState(START);
  const [type, setType] = useState("p2p");
  const [objectKeys, setObjectKeys] = useState(["apple", "banana"]);
  const [first, setFirst] = useState("apple");
  const [second, setSecond] = useState("banana");
  const [part, setPart] = useState("apple");
  const [challenge, setChallenge] = useState(null);
  const [notice, setNotice] = useState("");

  const groups = objectKeys.map((k) => ({ key: k, count: counts[k] || 0, ...ITEMS[k] }));
  const whole = groups.reduce((t, g) => t + g.count, 0);
  const [f, s] = type === "p2p" ? [first, second] : type === "p2w" ? [part, "whole"] : ["whole", part];
  const wholeWord = groups.map((x) => x.plural).join(" and ");
  const label = (slot) => (slot === "whole" ? `All ${wholeWord}` : groups.find((g) => g.key === slot).short);
  const ratio = whole === 0 || (type === "p2p" && counts[first] + counts[second] === 0) ? null : ratioFor(groups, f, s);
  const highlight = type === "p2p" ? { order: [f, s], focus: [f, s] } : { order: [f, s], whole: true, focus: [part] };

  const change = (key, d) => {
    setCounts((c) => ({ ...c, [key]: Math.min(MAX_COUNT, Math.max(0, c[key] + d)) }));
    if (challenge) {
      setChallenge(null);
      setNotice("You changed the board, so the challenge was cleared. Start a new one when you are ready.");
    }
  };
  const pickFirst = (k) => {
    setFirst(k);
    if (k === second) setSecond(objectKeys.find((x) => x !== k));
  };

  const g = (k) => groups.find((x) => x.key === k);
  let sentence = `Add some ${wholeWord} to make a ratio.`;
  if (ratio) {
    if (type === "p2p") sentence = `There are ${ratio[0]} ${noun(g(f), ratio[0])} for every ${ratio[1]} ${noun(g(s), ratio[1])}.`;
    else if (type === "p2w") sentence = `There are ${ratio[0]} ${noun(g(part), ratio[0])} out of ${whole} objects altogether.`;
    else sentence = `There are ${whole} objects altogether compared with ${ratio[1]} ${noun(g(part), ratio[1])}.`;
  }

  const nonEmpty = groups.filter((x) => x.count > 0);
  const canChallenge = nonEmpty.length >= 2;
  const newChallenge = () => {
    const todo = Object.keys(TYPE_NAMES).filter((t) => !progress.lab[t]);
    const t = pickRandom(todo.length ? todo : Object.keys(TYPE_NAMES), 1)[0];
    const [p1, p2] = pickRandom(nonEmpty.map((x) => x.key), 2);
    const [cf, cs] = t === "p2p" ? [p1, p2] : t === "p2w" ? [p1, "whole"] : ["whole", p1];
    const lab = (slot) => (slot === "whole" ? `all the ${wholeWord}` : g(slot).plural);
    setNotice("");
    setChallenge({
      id: `lab-${Date.now()}`,
      kind: "build",
      comparisonType: t,
      groups,
      wholeWord,
      first: cf,
      second: cs,
      showVisual: false,
      prompt: `Build the ratio of ${lab(cf)} to ${lab(cs)}.`,
      hint: t === "p2p" ? `Find the ${lab(cf)} card first.` : `The whole is all ${wholeWord} on the board.`,
      buildCards: [...nonEmpty.map((x) => ({ id: x.key, label: x.short, value: x.count })), { id: "whole", label: `All ${wholeWord}`, value: whole }],
    });
    update((st) => setLastActivity(st, "/lab", "Visual Lab"));
  };

  return (
    <div className="space-y-6" data-testid="lab-page">
      <PageTitle title="Ratio Lab" subtitle="Choose emoji objects, add or remove them, and watch each comparison update." testid="lab-title" />
      <div className="rq-card p-4 sm:p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-3">
          {objectKeys.map((key, index) => <label key={index} className="space-y-1 text-sm font-bold text-slate-700">{index === 0 ? "First object" : "Second object"}<span className="block text-2xl" aria-hidden="true">{ITEMS[key].emoji}</span><select aria-label={index === 0 ? "Choose first object" : "Choose second object"} className="w-full min-h-[44px] rounded-xl border-2 border-slate-300 bg-white px-3" value={key} onChange={(event) => {
            const nextKey = event.target.value;
            const next = [...objectKeys]; next[index] = nextKey; setObjectKeys(next);
            setCounts((current) => ({ ...current, [nextKey]: current[nextKey] ?? (index === 0 ? 2 : 3) }));
            if (index === 0) { setFirst(nextKey); setPart(nextKey); if (nextKey === second) setSecond(objectKeys[1]); }
            else { setSecond(nextKey); if (nextKey === first) { setFirst(objectKeys[0]); setPart(objectKeys[0]); } else if (part === objectKeys[1]) setPart(objectKeys[0]); }
            setChallenge(null);
          }}>{[...new Set(EMOJI_LIBRARY.map((item) => item.category))].map((category) => <optgroup key={category} label={category}>{EMOJI_LIBRARY.filter((item) => item.category === category).map((item) => <option key={item.key} value={item.key} disabled={objectKeys[1 - index] === item.key}>{item.emoji} {item.name}</option>)}</optgroup>)}</select></label>)}
        </div>
        <ObjectBoard groups={groups} wholeWord={wholeWord} onChange={change} highlight={highlight} testid="lab-board" />
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-semibold text-slate-800" data-testid="lab-whole">All objects: {groups.map((x) => x.count).join(" + ")} = {whole}</p>
          <button type="button" className="rq-btn-secondary" onClick={() => { setCounts(START); setObjectKeys(["apple", "banana"]); setFirst("apple"); setSecond("banana"); setPart("apple"); setType("p2p"); setChallenge(null); }} data-testid="lab-reset-btn">
            <RotateCcw size={18} aria-hidden="true" /> Reset board
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rq-card p-4 sm:p-6 space-y-4">
          <h2 className="font-heading text-xl font-semibold text-slate-900">1. Choose a comparison</h2>
          <ComparisonSelector value={type} onChange={setType} />
          {type === "p2p" ? (
            <div className="space-y-3">
              <Picker label="First group" value={first} options={objectKeys} onChange={pickFirst} testid="pick-first" groups={groups} />
              <Picker label="Second group" value={second} options={objectKeys.filter((k) => k !== first)} onChange={setSecond} testid="pick-second" groups={groups} />
            </div>
          ) : (
            <Picker label="Which part?" value={part} options={objectKeys} onChange={setPart} testid="pick-part" groups={groups} />
          )}
        </div>
        <div className="rq-card p-4 sm:p-6 space-y-4" aria-live="polite">
          <h2 className="font-heading text-xl font-semibold text-slate-900">2. The ratio</h2>
          <RatioDisplay firstLabel={label(f)} secondLabel={label(s)} value={ratio} testid="lab-ratio" />
          <p className="text-lg text-slate-800" data-testid="lab-sentence">{sentence}</p>
          {ratio && (type === "p2p" ? counts[first] === 0 || counts[second] === 0 : counts[part] === 0) && (
            <p className="text-sm text-orange-800 font-semibold" data-testid="lab-zero-note">One group has no objects yet, so its number is 0.</p>
          )}
        </div>
      </div>

      <section className="rq-card p-4 sm:p-6 space-y-4" aria-labelledby="build-heading" data-testid="build-section">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="build-heading" className="font-heading text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Hammer size={22} aria-hidden="true" /> 3. Build the ratio
          </h2>
          <div className="flex gap-2 text-sm" aria-label="Lab challenges completed">
            {Object.entries(TYPE_NAMES).map(([k, n]) => (
              <span key={k} className={`inline-flex items-center gap-1 rounded-full px-2 py-1 border ${progress.lab[k] ? "bg-green-50 border-green-400 text-green-900" : "bg-white border-slate-200 text-slate-600"}`} data-testid={`lab-done-${k}`}>
                {progress.lab[k] && <CheckCircle2 size={14} aria-hidden="true" />} {n}
              </span>
            ))}
          </div>
        </div>
        {notice && <p className="text-slate-700" data-testid="lab-notice">{notice}</p>}
        {challenge ? (
          <QuestionCard key={challenge.id} question={challenge} onComplete={() => { update((st) => recordLab(st, challenge.comparisonType)); setChallenge(null); setNotice("Great building! Try another challenge."); }} testid="lab-challenge" />
        ) : (
          <div className="space-y-2">
            <p className="text-slate-700">Rafi will ask for a ratio using the emoji objects on your board. Tap the count cards to build it.</p>
            <button type="button" className="rq-btn-primary" onClick={newChallenge} disabled={!canChallenge} data-testid="new-challenge-btn">
              New challenge
            </button>
            {!canChallenge && <p className="text-sm text-slate-600" data-testid="lab-need-two">Add at least one object to each group first.</p>}
          </div>
        )}
      </section>
    </div>
  );
}

export default function LabPage() {
  const { year } = useCourse();
  return year === "year6" ? <Year6VisualLab /> : <Year5LabPage />;
}
