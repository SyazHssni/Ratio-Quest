import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PageTitle } from "../components/rq/AppShell";
import { Year6EmojiModel } from "../components/rq/Year6EmojiModel";
import { useProgress } from "../context/ProgressContext";
import { useAudio } from "../audio/AudioContext";
import { YEAR6_QUESTIONS } from "../data/year6Course";

const levels = ["all", "easy", "medium", "challenging"];
const normalized = (value, type) => type === "ratioInput" ? String(value).trim().toLowerCase().replace(/\s+/g, "").replace(/to/g, ":") : String(value).trim();
const answerMatches = (question, answer) => normalized(answer, question.answerType) === normalized(question.correctAnswer, question.answerType);
const HISTORY_KEY = "ratio-quest-year6-question-history-v1";
const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
const balancedPracticeSet = (pool, count) => {
  const byStandard = new Map();
  pool.forEach((q) => byStandard.set(q.learningStandard, [...(byStandard.get(q.learningStandard) || []), q]));
  const standards = [...byStandard.keys()].sort(); const selected = [];
  standards.forEach((standard, standardIndex) => {
    const target = Math.floor(count / standards.length) + (standardIndex < count % standards.length ? 1 : 0);
    const byCategory = new Map();
    byStandard.get(standard).forEach((q) => { const key = q.questionCategory || q.learningStandard; byCategory.set(key, [...(byCategory.get(key) || []), q]); });
    const buckets = [...byCategory.values()].map(shuffle); let pickedForStandard = 0;
    while (pickedForStandard < target && buckets.some((bucket) => bucket.length)) buckets.forEach((bucket) => { if (pickedForStandard < target && bucket.length) { selected.push(bucket.shift()); pickedForStandard += 1; } });
  });
  // Distribute answer formats where the selected pool supports them.
  return selected.sort((a, b) => (a.answerType === b.answerType ? 0 : a.answerType === "numeric" ? -1 : 1));
};
const fixedAssessmentSet = (pool) => {
  const result = [];
  ["7.2.1", "7.3.1"].forEach((standard) => {
    [["foundational", 2], ["intermediate", 2], ["challenging-contextual", 1]].forEach(([tier, amount]) => {
      const category = standard === "7.2.1" ? `simplifying-${tier}` : `proportion-${tier}`;
      const items = pool.filter((q) => q.learningStandard === standard && q.questionCategory === category).sort((a, b) => a.id.localeCompare(b.id));
      if (amount === 2) {
        result.push(items.find((q) => q.answerType === "numeric"));
        result.push(items.find((q) => q.answerType === "choice"));
      } else {
        result.push(items.find((q) => q.answerType === (standard === "7.2.1" ? "choice" : "numeric")));
      }
    });
  });
  return result;
};

export function Year6Practice({ assessment = false }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { year6Progress, updateYear6 } = useProgress();
  const { playSound } = useAudio();
  const [topic, setTopic] = useState(() => assessment ? "mixed" : ["7.2.1", "7.3.1", "mixed"].includes(searchParams.get("topic")) ? searchParams.get("topic") : "7.2.1");
  const [level, setLevel] = useState("all");
  const [session, setSession] = useState(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const requiredLessons = ["meaning", "simplest", "factors", "preserve", "scale", "missing", "both", "connect"];
  const finalUnlocked = requiredLessons.every((id) => year6Progress.done?.[id]);
  const pool = useMemo(() => YEAR6_QUESTIONS.filter((q) => (topic === "mixed" ? true : q.learningStandard === topic && !q.secondaryLearningStandard) && (level === "all" || q.difficulty === level)), [topic, level]);
  const start = () => {
    let set;
    if (assessment) set = fixedAssessmentSet(pool);
    else {
      let history = [];
      try { history = JSON.parse(window.localStorage.getItem(HISTORY_KEY) || "[]"); } catch { history = []; }
      const freshPool = pool.filter((q) => !history.includes(q.id));
      set = balancedPracticeSet(freshPool.length >= 6 ? freshPool : pool, Math.min(6, pool.length));
      try { window.localStorage.setItem(HISTORY_KEY, JSON.stringify([...history, ...set.map((q) => q.id)].slice(-60))); } catch { /* storage can be disabled; current session still works */ }
    }
    setSession(set.filter(Boolean)); setIndex(0); setPicked(null); setFeedback(null); setResults([]); setSummary(null); playSound("levelStart");
  };
  const question = session?.[index];
  const check = () => {
    if (picked === null || feedback || !question) return;
    const correct = answerMatches(question, picked);
    setFeedback({ correct, text: correct ? question.explanation : `${question.feedback.wrong} ${question.explanation}` });
    setResults((r) => r.some((result) => result.questionId === question.id) ? r : [...r, { questionId: question.id, correct, standard: question.learningStandard }]);
    updateYear6((p) => { const byStandard = { ...p.byStandard }; byStandard[question.learningStandard] = { attempted: byStandard[question.learningStandard].attempted + 1, correct: byStandard[question.learningStandard].correct + (correct ? 1 : 0) }; return { ...p, attempted: p.attempted + 1, correct: p.correct + (correct ? 1 : 0), byStandard }; });
    playSound(correct ? "correct" : "incorrect");
  };
  const next = () => {
    if (index + 1 === session.length) { const completed = results.some((r) => r.questionId === question.id) ? results : [...results, { questionId: question.id, correct: Boolean(feedback?.correct), standard: question.learningStandard }]; const totalCorrect = completed.filter((r) => r.correct).length; setSummary({ correct: totalCorrect, total: session.length, results: completed }); if (assessment) updateYear6((p) => ({ ...p, final: { attempts: p.final.attempts + 1, best: p.final.best === null ? totalCorrect : Math.max(p.final.best, totalCorrect), last: totalCorrect } })); setSession(null); setFeedback(null); playSound("levelComplete"); return; }
    setIndex((i) => i + 1); setPicked(null); setFeedback(null); playSound("next");
  };
  if (assessment && !finalUnlocked) return <div className="rq-card p-6 max-w-2xl space-y-4" data-testid="year6-final-locked"><PageTitle title="Year 6 Final Challenge is locked" subtitle="Complete the three Year 6 checkpoints first." testid="final-title" /><p className="text-slate-700">Your Year 5 checkpoint progress does not unlock this challenge.</p><Link to="/learn?year=6" className="rq-btn-primary">Go to Year 6 Learn</Link></div>;
  return <div className="space-y-6" data-testid={assessment ? "year6-final-page" : "year6-practice-page"}>
    <PageTitle title={assessment ? "Year 6 Final Challenge" : "Practice · Year 6"} subtitle={assessment ? "A mixed set covering ratio simplification and proportionate quantities." : "Practise either learning standard or mix both. Every question explains the reasoning."} testid={assessment ? "final-title" : "practice-title"} />
    {!session && <section className="rq-card p-5 sm:p-6 space-y-5">{!assessment && <><div role="radiogroup" aria-label="Learning standard" className="flex flex-wrap gap-2">{[["7.2.1", "Simplest form"], ["7.3.1", "Proportionate quantities"], ["mixed", "Mixed practice"]].map(([id, name]) => <button key={id} role="radio" aria-checked={topic === id} onClick={() => { setTopic(id); const next = new URLSearchParams(searchParams); next.set("year", "6"); next.set("topic", id); setSearchParams(next); }} className={`min-h-11 rounded-xl border-2 px-4 font-semibold ${topic === id ? "bg-teal-700 text-white border-teal-700" : "bg-white border-slate-200"}`}>{name}</button>)}</div><div role="radiogroup" aria-label="Difficulty" className="flex flex-wrap gap-2">{levels.map((l) => <button key={l} role="radio" aria-checked={level === l} onClick={() => setLevel(l)} className={`min-h-10 rounded-xl border px-3 capitalize ${level === l ? "bg-slate-900 text-white" : "bg-white"}`}>{l === "all" ? "All levels" : l}</button>)}</div></>}
      {summary ? <div className="rounded-xl bg-teal-50 border border-teal-200 p-4"><h2 className="font-bold">Set complete: {summary.correct}/{summary.total} correct on the first try</h2><p>7.2.1: {summary.results.filter((r) => r.standard === "7.2.1" && r.correct).length} correct · 7.3.1: {summary.results.filter((r) => r.standard === "7.3.1" && r.correct).length} correct</p></div> : <><p>{pool.length} eligible Year 6 questions. Sessions use unique questions without replacement.</p><button className="rq-btn-primary" disabled={!pool.length} onClick={start}>{assessment ? "Start final challenge" : "Start practice"}</button></>}</section>}
    {session && question && <section className="rq-card p-5 sm:p-7 space-y-5" aria-live="polite"><p className="text-sm font-bold text-slate-600">{assessment ? "Final challenge" : "Practice"} · {index + 1} of {session.length} · Standard {question.secondaryLearningStandard ? "7.2.1 + 7.3.1" : question.learningStandard} · {question.difficulty}</p><h2 className="font-heading text-xl sm:text-2xl font-semibold">{question.question}</h2>{question.visual && <div className="grid lg:grid-cols-2 gap-3"><Year6EmojiModel title="Count the quantities" first={question.visual.first} second={question.visual.second} />{question.visual.scaledFirst && feedback && <Year6EmojiModel title={`Scale both by ${question.visual.scaleFactor}`} first={{ ...question.visual.first, key: `${question.id}-scaled-a`, count: question.visual.scaledFirst }} second={{ ...question.visual.second, key: `${question.id}-scaled-b`, count: question.visual.scaledSecond }} operation="same factor on each quantity" />}</div>}{question.answerType === "choice" ? <div className="grid sm:grid-cols-2 gap-3">{question.options.map((option) => <button key={option} disabled={Boolean(feedback)} onClick={() => setPicked(option)} aria-pressed={picked === option} className={`min-h-12 rounded-xl border-2 p-3 text-left font-semibold ${picked === option ? "border-teal-700 bg-teal-50" : "border-slate-200"}`}>{option}</button>)}</div> : <label className="block space-y-2 font-semibold">{question.answerType === "numeric" ? "Enter the missing whole number" : "Write the ratio in simplest form"}<input type="text" inputMode={question.answerType === "numeric" ? "numeric" : "text"} autoComplete="off" disabled={Boolean(feedback)} value={picked ?? ""} onChange={(e) => setPicked(e.target.value)} placeholder={question.answerType === "numeric" ? "Whole number" : "For example, 2 : 3"} className="block w-full rounded-xl border-2 border-slate-300 p-3" /></label>}{!feedback ? <><p className="text-slate-600"><strong>Hint:</strong> {question.hint}</p><button className="rq-btn-primary" disabled={picked === null || picked === ""} onClick={check}>Check answer</button></> : <div className={`p-4 rounded-xl border ${feedback.correct ? "bg-green-50 border-green-300" : "bg-amber-50 border-amber-300"}`}><p className="font-bold">{feedback.correct ? "Correct!" : "Check the relationship."}</p><p>{feedback.text}</p>{!assessment && !feedback.correct && <button className="rq-btn-secondary mt-3 mr-2" onClick={() => { setPicked(null); setFeedback(null); playSound("select"); }}>Try this question again</button>}<button className="rq-btn-primary mt-3" onClick={next}>{index + 1 === session.length ? "Finish" : "Next question"}</button></div>}</section>}
    <section className="rq-card p-5"><h2 className="font-heading text-xl font-bold">Year 6 evidence so far</h2><p>{year6Progress.attempted} attempted · {year6Progress.correct} correct</p><p className="text-sm text-slate-700">7.2.1: {year6Progress.byStandard["7.2.1"].correct}/{year6Progress.byStandard["7.2.1"].attempted} · 7.3.1: {year6Progress.byStandard["7.3.1"].correct}/{year6Progress.byStandard["7.3.1"].attempted}</p></section>
  </div>;
}

export function Year6VisualLab() {
  const [a, setA] = useState(6); const [b, setB] = useState(9); const [factor, setFactor] = useState(2);
  const gcd = (x, y) => y ? gcd(y, x % y) : x;
  const common = gcd(a, b);
  return <div className="space-y-6" data-testid="year6-lab-page"><PageTitle title="Visual Lab · Year 6" subtitle="Explore how dividing both terms by a common factor and multiplying both terms by the same factor preserve a ratio." testid="lab-title" />
    <div className="grid lg:grid-cols-2 gap-5"><section className="rq-card p-5 space-y-4"><h2 className="font-heading text-xl font-bold">Simplify a ratio</h2><p>Choose two positive whole-number counts. The Ratio Quest object groups update as you change either quantity.</p><div className="grid grid-cols-2 gap-3">{[["First quantity", a, setA], ["Second quantity", b, setB]].map(([label, n, setter]) => <label key={label} className="space-y-1 font-semibold">{label}<input aria-label={label} type="number" min="1" max="20" step="1" value={n} onChange={(e) => setter(Math.max(1, Math.min(20, Math.round(Number(e.target.value) || 1))))} className="block w-full rounded-xl border-2 p-3" /></label>)}</div><Year6EmojiModel title="Original collection" first={{ key: "lab-apples", plural: "apples", singular: "apple", emoji: "🍎", tone: "red", count: a }} second={{ key: "lab-oranges", plural: "oranges", singular: "orange", emoji: "🍊", tone: "orange", count: b }} operation={`${a} : ${b}`} /><Year6EmojiModel title={`${common} equal groups · simplest ratio`} first={{ key: "lab-apples-simple", plural: "apples in each group", singular: "apple", emoji: "🍎", tone: "red", count: a / common }} second={{ key: "lab-oranges-simple", plural: "oranges in each group", singular: "orange", emoji: "🍊", tone: "orange", count: b / common }} operation={`divide both terms by ${common} → ${a / common} : ${b / common}`} /><p className="text-slate-700">Both quantities can be split into {common} equal groups. Each group has {a / common} apples and {b / common} oranges.</p></section>
      <section className="rq-card p-5 space-y-4"><h2 className="font-heading text-xl font-bold">Scale both quantities</h2><p>Multiply each part by the same positive whole-number factor. The object groups and labels follow your selection.</p><label className="space-y-1 font-semibold">Scale factor<input aria-label="Scale factor" type="number" min="1" max="10" step="1" value={factor} onChange={(e) => setFactor(Math.max(1, Math.min(10, Math.round(Number(e.target.value) || 1))))} className="block w-full rounded-xl border-2 p-3" /></label><Year6EmojiModel title="Scaled apple and orange collection" first={{ key: "lab-scale-apples", plural: "apples", singular: "apple", emoji: "🍎", tone: "red", count: a * factor }} second={{ key: "lab-scale-oranges", plural: "oranges", singular: "orange", emoji: "🍊", tone: "orange", count: b * factor }} operation={`${a} : ${b} × ${factor} = ${a * factor} : ${b * factor}`} /><p>Both quantities use ×{factor}; the relationship is maintained. The scaled ratio simplifies to {a / common} : {b / common}.</p></section></div>
  </div>;
}
