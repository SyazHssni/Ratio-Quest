import { useState } from "react";
import { Printer, AlertCircle } from "lucide-react";
import { PageTitle } from "../components/rq/AppShell";
import { ObjectToken } from "../components/rq/ObjectToken";
import { useProgress } from "../context/ProgressContext";
import { CATEGORIES } from "../lib/misconceptions";
import { questionById } from "../data/questionBank";
import { LESSONS, LESSON_ORDER } from "../data/lessons";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { Switch } from "../components/ui/switch";

const SHEET_IDS = ["p2p-03", "p2p-06", "p2p-10", "p2p-14", "p2w-03", "p2w-06", "p2w-10", "p2w-13", "w2p-03", "w2p-06", "w2p-09", "w2p-13"];

const CLASSROOM_QS = [
  "Which two things are being compared? Which one is named first?",
  "Is the whole in this question? How do you know?",
  "Can you make three different correct ratios from these counters? What question does each one answer?",
  "Rafi says 2 : 3 means 5 red balls. How would you help him?",
  "Why does 3 : 5 mean something different from 5 : 3 here?",
  "Is the ratio 2 : 3 the same as the fraction 2/5? What does each one describe?",
];

const SUMMARY = [
  { type: "Parts to parts", ex: "Red : Blue = 2 : 3", note: "One group compared with another group." },
  { type: "Part to whole", ex: "Red : Whole = 2 : 5", note: "One group compared with all the objects (2 + 3 = 5)." },
  { type: "Whole to part", ex: "Whole : Red = 5 : 2", note: "All the objects compared with one group." },
];

function PrintSheet() {
  const [answers, setAnswers] = useState(false);
  const qs = SHEET_IDS.map(questionById).filter(Boolean);
  return (
    <section className="rq-card p-5 sm:p-6 space-y-4" aria-labelledby="sheet-heading" data-testid="print-sheet-section">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <h2 id="sheet-heading" className="font-heading text-2xl font-bold text-slate-900">Printable practice sheet</h2>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch id="answer-key" checked={answers} onCheckedChange={setAnswers} data-testid="answer-key-switch" />
            <label htmlFor="answer-key" className="font-semibold text-slate-800">Show answer key</label>
          </div>
          <button type="button" className="rq-btn-primary" onClick={() => window.print()} data-testid="print-sheet-btn">
            <Printer size={20} aria-hidden="true" /> Print sheet
          </button>
        </div>
      </div>
      <div className="print-area space-y-4 bg-white p-2" data-testid="print-sheet">
        <div>
          <p className="font-heading text-xl font-bold text-slate-900">Ratio Quest — Practice Sheet</p>
          <p className="text-sm text-slate-700">Name: ____________________ Date: ____________</p>
          <p className="text-sm text-slate-700">Write each ratio as a : b. Read carefully: what comes first?</p>
        </div>
        <ol className="grid md:grid-cols-2 gap-3 list-none">
          {qs.map((q, i) => (
            <li key={q.id} className="border border-slate-300 rounded-xl p-3 break-inside-avoid" data-testid={`sheet-q-${i}`}>
              <p className="font-semibold text-slate-900">{i + 1}. {q.prompt.replace("Look at", "In")}</p>
              <p className="text-sm text-slate-700 mt-1">
                Picture: {q.groups.map((g) => `${g.count} ${g.plural}`).join(" and ")}
              </p>
              <div className="flex flex-wrap gap-0.5 my-1" aria-hidden="true">
                {q.groups.flatMap((g) => Array.from({ length: g.count }).map((_, k) => <ObjectToken key={`${g.key}${k}`} item={g} size={18} />))}
              </div>
              <p className="ratio-mono text-lg">Answer: {answers ? <strong data-testid={`sheet-answer-${i}`}>{q.correctAnswer.join(" : ")}</strong> : "____ : ____"}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function LocalSummary() {
  const { progress } = useProgress();
  const mc = Object.entries(progress.misconceptions).filter(([k]) => CATEGORIES[k]);
  return (
    <section className="rq-card p-5 sm:p-6 space-y-3" aria-labelledby="local-heading" data-testid="teacher-local-summary">
      <h2 id="local-heading" className="font-heading text-2xl font-bold text-slate-900">Learner summary (this device only)</h2>
      <p className="flex items-start gap-2 text-sm text-slate-700 bg-sky-50 border border-sky-200 rounded-xl p-3">
        <AlertCircle size={18} className="shrink-0" aria-hidden="true" />
        This data exists only in this browser on this device. There is no class account or live class analytics.
      </p>
      <ul className="grid sm:grid-cols-3 gap-3">
        {LESSON_ORDER.map((id) => {
          const l = progress.lessons[id];
          return (
            <li key={id} className="rounded-xl border border-slate-200 p-3">
              <p className="font-semibold text-slate-900">{LESSONS[id].title}</p>
              <p className="text-sm text-slate-700">{l.mastered ? "Mastered" : "Not yet mastered"} · Best {l.bestScore ?? "–"}/5 · {l.attempts} attempt(s)</p>
            </li>
          );
        })}
      </ul>
      <p className="text-slate-800">Final Challenge: {progress.final.best === null ? "not attempted" : `best ${progress.final.best}/15, latest ${progress.final.last}/15`}. Hints used: {progress.hintsUsed}.</p>
      <div>
        <p className="font-semibold text-slate-900">Error patterns recorded (counts of answers, not diagnoses):</p>
        {mc.length === 0 ? (
          <p className="text-slate-700">None recorded yet.</p>
        ) : (
          <ul className="list-disc pl-6 text-slate-800" data-testid="teacher-misconception-list">
            {mc.map(([k, n]) => (
              <li key={k}>{k}. {CATEGORIES[k].name}: {n}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default function TeacherPage() {
  return (
    <div className="space-y-6" data-testid="teacher-page">
      <PageTitle title="Teacher Corner" subtitle="Learning standard 7.2.1: represent the ratio of two quantities in the form a : b — parts to parts, parts to whole, whole to part." testid="teacher-title" />
      <section className="rq-card p-5 sm:p-6 space-y-3" aria-labelledby="objectives-heading">
        <h2 id="objectives-heading" className="font-heading text-2xl font-bold text-slate-900">Learning objectives</h2>
        <ul className="list-disc pl-6 text-slate-800 space-y-1">
          {LESSON_ORDER.map((id) => <li key={id}><strong>{LESSONS[id].title}:</strong> {LESSONS[id].goal}</li>)}
          <li>Explain why changing the order changes the meaning, and that one collection can give several correct ratios.</li>
          <li>Distinguish a ratio (2 : 3, red to blue) from a fraction of the whole (2/5 of the balls are red).</li>
        </ul>
      </section>
      <section className="rq-card p-5 sm:p-6 space-y-3" aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="font-heading text-2xl font-bold text-slate-900">The three ratio types (2 red, 3 blue)</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {SUMMARY.map((s) => (
            <div key={s.type} className="rounded-xl border-2 border-slate-200 p-4">
              <p className="font-semibold text-slate-900">{s.type}</p>
              <p className="ratio-mono text-xl font-bold text-teal-800">{s.ex}</p>
              <p className="text-sm text-slate-700">{s.note}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="rq-card p-5 sm:p-6 space-y-3" aria-labelledby="mis-heading">
        <h2 id="mis-heading" className="font-heading text-2xl font-bold text-slate-900">Misconception guide</h2>
        <p className="text-slate-800">A single wrong answer is not enough to establish a misconception. Look for repeated patterns and listen to pupils' explanations. Ratio Quest records answer patterns as evidence, not as labels.</p>
        <Accordion type="multiple" className="w-full">
          {Object.values(CATEGORIES).map((c) => (
            <AccordionItem key={c.code} value={c.code} data-testid={`mis-${c.code}`}>
              <AccordionTrigger className="text-left font-semibold text-slate-900 min-h-[48px]">{c.code}. {c.name}</AccordionTrigger>
              <AccordionContent className="text-slate-800 text-base">{c.teacher}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
      <section className="rq-card p-5 sm:p-6 space-y-3" aria-labelledby="classroom-heading">
        <h2 id="classroom-heading" className="font-heading text-2xl font-bold text-slate-900">Suggested classroom questions</h2>
        <ul className="list-disc pl-6 text-slate-800 space-y-1">{CLASSROOM_QS.map((q) => <li key={q}>{q}</li>)}</ul>
        <p className="text-sm text-slate-700">Cross-multiplication and proportion-solving are beyond this Year 5 standard and are intentionally not taught here.</p>
      </section>
      <PrintSheet />
      <LocalSummary />
    </div>
  );
}
