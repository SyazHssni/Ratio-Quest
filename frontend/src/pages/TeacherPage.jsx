import { useState } from "react";
import { Link } from "react-router-dom";
import { Printer, AlertCircle } from "lucide-react";
import { PageTitle } from "../components/rq/AppShell";
import { ObjectToken } from "../components/rq/ObjectToken";
import { ObjectBoard } from "../components/rq/ObjectBoard";
import { useProgress } from "../context/ProgressContext";
import { CATEGORIES } from "../lib/misconceptions";
import { questionById } from "../data/questionBank";
import { LESSONS, LESSON_ORDER } from "../data/lessons";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { Switch } from "../components/ui/switch";
import { makeGroups } from "../data/objects";
import { ratioFor } from "../lib/ratio";
import { QUESTION_BLUEPRINT, QUESTION_SOURCES } from "../data/questionSources";
import { QUESTION_BANK, QUESTION_COUNTS, QUESTION_DIVERSITY_STATS } from "../data/questionBank";
import { useCourse } from "../context/CourseContext";
import { YEAR6_LESSONS, YEAR6_QUESTIONS, YEAR6_QUESTION_REPORT } from "../data/year6Course";

const SHEET_IDS = ["p2p-03", "p2p-07", "p2p-13", "p2p-17", "p2w-03", "p2w-09", "p2w-13", "p2w-17", "w2p-03", "w2p-09", "w2p-13", "w2p-17"];

const CLASSROOM_QS = [
  "Which two things are being compared? Which one is named first?",
  "Is the whole in this question? How do you know?",
  "Can you make three different correct ratios from these fruits? What question does each one answer?",
  "Rafi says 2 : 3 means 5 apples. How would you help him?",
  "Why does 3 : 5 mean something different from 5 : 3 here?",
  "Is the ratio 2 : 3 the same as the fraction 2/5? What does each one describe?",
];

const SUMMARY_GROUPS = makeGroups("fruit", 2, 3);
const SUMMARY = [
  { type: "Parts to parts", first: SUMMARY_GROUPS[0].key, second: SUMMARY_GROUPS[1].key, ex: "Apples : Bananas", note: "One group compared with another group." },
  { type: "Part to whole", first: SUMMARY_GROUPS[0].key, second: "whole", ex: "Apples : Whole", note: "One group compared with all the fruits." },
  { type: "Whole to part", first: "whole", second: SUMMARY_GROUPS[0].key, ex: "Whole : Apples", note: "All the fruits compared with one group." },
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

function QuestionBankReferences() {
  return (
    <section className="rq-card p-5 sm:p-6 space-y-4" aria-labelledby="question-references-heading" data-testid="question-bank-references">
      <h2 id="question-references-heading" className="font-heading text-2xl font-bold text-slate-900">Question bank blueprint and references</h2>
      <p className="text-slate-800">
        The bank contains {QUESTION_BANK.length} original questions: {QUESTION_COUNTS.easy} easy, {QUESTION_COUNTS.medium} medium, and {QUESTION_COUNTS.challenging} challenging. Each level has all three comparison types. Questions marked “Original exam-style reasoning” are original items informed by the linked assessment format; none is presented as an authentic or adapted examination item.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3" data-testid="question-diversity-report">
        <p className="rounded-xl bg-slate-50 p-3"><strong>{QUESTION_DIVERSITY_STATS.questionFamilies}</strong> question families</p>
        <p className="rounded-xl bg-slate-50 p-3"><strong>{QUESTION_DIVERSITY_STATS.structuralSignatures}</strong> measured structural signatures</p>
        <p className="rounded-xl bg-slate-50 p-3"><strong>{QUESTION_DIVERSITY_STATS.distinctObjectTypes}</strong> object types across <strong>{QUESTION_DIVERSITY_STATS.distinctContextCategories}</strong> categories</p>
        <p className="rounded-xl bg-slate-50 p-3"><strong>{QUESTION_DIVERSITY_STATS.repeatedObjectPairs.length}</strong> object combinations exceed 3% frequency; highest count {QUESTION_DIVERSITY_STATS.maxObjectPairFrequency}</p>
        <p className="rounded-xl bg-slate-50 p-3"><strong>{QUESTION_DIVERSITY_STATS.similarityReviewClusters}</strong> shared-template clusters flagged for review ({QUESTION_DIVERSITY_STATS.questionsInSharedTemplateClusters} questions)</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" data-testid="question-blueprint">
          <thead><tr><th scope="col" className="border-b p-2">Level</th><th scope="col" className="border-b p-2">Questions</th><th scope="col" className="border-b p-2">Focus</th></tr></thead>
          <tbody>{QUESTION_BLUEPRINT.map((row) => <tr key={row.difficulty}><th scope="row" className="border-b p-2 capitalize">{row.difficulty}</th><td className="border-b p-2">{row.target}</td><td className="border-b p-2">{row.purpose}</td></tr>)}</tbody>
        </table>
      </div>
      <p className="font-semibold text-slate-900">Verified references and how they were used</p>
      <ul className="list-disc pl-6 space-y-3 text-slate-800">
        {Object.values(QUESTION_SOURCES).map((source) => (
          <li key={source.id} data-testid={`question-source-${source.id}`}>
            <p><strong>{source.title}</strong> — {source.organizationOrPublisher}{source.year ? ` (${source.year})` : ""}. {source.gradeOrLevel}. {source.paperOrSection || ""}</p>
            <p>{source.notes}</p>
            <p>Source type: {source.sourceType}. <a className="font-semibold text-teal-800 underline" href={source.url} target="_blank" rel="noreferrer">Open verified source</a> · Verification status: {source.verificationStatus} · Accessed {source.accessDate}.</p>
          </li>
        ))}
      </ul>
      <p className="text-sm text-slate-700">All question wording and values in this bank are original. The references document curriculum alignment and assessment-style research; they are not claims that these items appeared in an examination.</p>
    </section>
  );
}

function Year5TeacherPage() {
  return (
    <div className="space-y-6" data-testid="teacher-page">
      <PageTitle title="Teacher Corner" subtitle="Learning standard 7.2.1: represent the ratio of two quantities in the form a : b — parts to parts, parts to whole, whole to part." testid="teacher-title" />
      <section className="rq-card p-5 sm:p-6 space-y-3" aria-labelledby="objectives-heading">
        <h2 id="objectives-heading" className="font-heading text-2xl font-bold text-slate-900">Learning objectives</h2>
        <ul className="list-disc pl-6 text-slate-800 space-y-1">
          {LESSON_ORDER.map((id) => <li key={id}><strong>{LESSONS[id].title}:</strong> {LESSONS[id].goal}</li>)}
          <li>Explain why changing the order changes the meaning, and that one collection can give several correct ratios.</li>
          <li>Distinguish a ratio (2 : 3, apples to bananas) from a fraction of the whole (2/5 of the fruits are apples).</li>
        </ul>
      </section>
      <section className="rq-card p-5 sm:p-6 space-y-3" aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="font-heading text-2xl font-bold text-slate-900">The three ratio types (2 🍎 apples, 3 🍌 bananas)</h2>
        <ObjectBoard groups={SUMMARY_GROUPS} wholeWord="fruits" testid="teacher-summary-board" />
        <div className="grid sm:grid-cols-3 gap-3">
          {SUMMARY.map((s) => (
            <div key={s.type} className="rounded-xl border-2 border-slate-200 p-4">
              <p className="font-semibold text-slate-900">{s.type}</p>
              <p className="ratio-mono text-xl font-bold text-teal-800">{s.ex} = {ratioFor(SUMMARY_GROUPS, s.first, s.second).join(" : ")}</p>
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
      <QuestionBankReferences />
      <PrintSheet />
      <LocalSummary />
    </div>
  );
}

function Year6TeacherPage() {
  const { year6Progress } = useProgress();
  const parameterisedCount = Object.values(YEAR6_QUESTION_REPORT.byCategory).reduce((total, count) => total + count, 0);
  return <div className="space-y-6" data-testid="teacher-page" data-course="year6">
    <PageTitle title="Teacher Corner · Year 6" subtitle="A shared teacher reference for Year 6 Ratio and Proportion, aligned with Learning Standards 7.2.1 and 7.3.1." testid="teacher-title" />
    <section className="rq-card p-5 sm:p-6 space-y-3"><h2 className="font-heading text-2xl font-bold">Learning objectives and lesson sequence</h2><ol className="list-decimal pl-6 space-y-2">{YEAR6_LESSONS.map((lesson) => <li key={lesson.id}><strong>{lesson.title} ({lesson.standard}):</strong> {lesson.goal}</li>)}</ol></section>
    <section className="rq-card p-5 sm:p-6 space-y-3"><h2 className="font-heading text-2xl font-bold">Standards and formative evidence</h2><ul className="list-disc pl-6 space-y-2"><li><strong>7.2.1:</strong> Pupils identify ordered quantities, divide both terms by the same common factor, explain equivalence, and recognize simplest form.</li><li><strong>7.3.1:</strong> Pupils identify the multiplier and use it for the corresponding quantity or quantities, then verify the relationship.</li><li>Current Year 6 bank: {YEAR6_QUESTIONS.length} records, including {parameterisedCount} parameterised library items and {YEAR6_QUESTIONS.filter((q) => q.secondaryLearningStandard).length} integrated records. The library has 40 items in each of its six standard/difficulty categories. Automated computation, option, prompt, and visual-count checks pass; teacher review of explanations and age-level suitability is still recommended.</li></ul><p>Current evidence: 7.2.1 {year6Progress.byStandard["7.2.1"].correct}/{year6Progress.byStandard["7.2.1"].attempted}; 7.3.1 {year6Progress.byStandard["7.3.1"].correct}/{year6Progress.byStandard["7.3.1"].attempted} correct.</p></section>
    <section className="rq-card p-5 sm:p-6 space-y-3"><h2 className="font-heading text-2xl font-bold">Misconceptions to listen for</h2><ul className="list-disc pl-6 space-y-1"><li>Dividing only one ratio term or dividing the terms by different factors.</li><li>Subtracting the same number from each term and assuming equivalence.</li><li>Applying a scale factor to just one quantity.</li><li>Reversing the order of quantities.</li><li>Confusing a part-to-part ratio with a fraction of the whole.</li></ul><p>A single incorrect response is not enough to diagnose a misconception. Ask pupils to explain the groups or scale factor and check patterns across activities.</p></section>
    <section className="rq-card p-5"><h2 className="font-heading text-xl font-bold">Performance-standard alignment</h2><p>The topic's Performance Standard Level 3 names simplest-form ratios and determining proportionate quantities. Levels 4–6 involve routine and non-routine daily problems, including using multiple strategies. The current question pool primarily supports levels 2–3; it does not establish full performance at levels 4–6.</p><Link to="/practice?year=6" className="rq-btn-primary mt-3">Open Year 6 practice</Link></section>
  </div>;
}

export default function TeacherPage() {
  const { year } = useCourse();
  return year === "year6" ? <Year6TeacherPage /> : <Year5TeacherPage />;
}
