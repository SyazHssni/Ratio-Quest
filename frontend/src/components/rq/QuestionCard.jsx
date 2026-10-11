import { useEffect, useRef, useState } from "react";
import { HelpCircle } from "lucide-react";
import { ObjectBoard } from "./ObjectBoard";
import { FeedbackPanel } from "./FeedbackPanel";
import { ChoiceAnswer, RatioInput, BuildAnswer } from "./Answers";
import { RafiSays } from "./Rafi";
import { classifyAnswer, classifyTotal, feedbackFor, totalFeedback, correctMessage, workedSteps, looksUnstable } from "../../lib/misconceptions";
import { normaliseRatioAnswer, slotValue } from "../../lib/ratio";
import { simplerQuestion } from "../../data/questionBank";
import { useProgress } from "../../context/ProgressContext";
import { recordAnswer, recordHint, recordMisconception } from "../../lib/progress";
import { useAudio } from "../../audio/AudioContext";

const parseOption = (s) => s.split(":").map((x) => parseInt(x.trim(), 10));
const lab = (q, slot) => (slot === "whole" ? `all the ${q.wholeWord}` : q.groups.find((g) => g.key === slot).plural);

function evaluate(q, raw) {
  if (q.kind === "total") {
    const r = classifyTotal(q, raw);
    if (r.category === "correct") {
      const whole = slotValue(q.groups, "whole");
      return { r, fb: { title: "Yes! You found the whole.", message: `${q.groups.map((g) => g.count).join(" + ")} = ${whole}. The whole includes every group.` } };
    }
    return { r, fb: totalFeedback(q, r) };
  }
  if (q.kind === "meaning") {
    const opt = q.answerOptions[raw];
    const r = { category: opt.category };
    if (r.category === "correct") return { r, fb: { title: "Yes! You know what each number means.", message: q.correctText || `The first number counts ${lab(q, q.first)} and the second counts ${lab(q, q.second)}.` } };
    return { r, fb: q.feedback?.[r.category] || feedbackFor(q, r) };
  }
  const r = classifyAnswer(q, raw);
  if (r.category === "correct") return { r, fb: { title: "Well done!", message: correctMessage(q) } };
  return { r, fb: feedbackFor(q, r) };
}

const involvesWhole = (q) => q.first === "whole" || q.second === "whole";

export function QuestionCard({ question, mode = "practice", onComplete, hintOpen = false, testid = "question-card" }) {
  const { update } = useProgress();
  const { playSound } = useAudio();
  const [q, setQ] = useState(question);
  const [isSimpler, setIsSimpler] = useState(false);
  const [selected, setSelected] = useState(null);
  const [text, setText] = useState("");
  const [slots, setSlots] = useState([null, null]);
  const [inputError, setInputError] = useState(null);
  const [status, setStatus] = useState("answering");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHint, setShowHint] = useState(hintOpen);
  const firstResult = useRef(null);
  const lock = useRef(false);
  const fbRef = useRef(null);
  const practice = mode === "practice";

  useEffect(() => {
    if (status !== "answering") fbRef.current?.focus();
  }, [status]);

  const resetInputs = () => {
    setSelected(null);
    setText("");
    setSlots([null, null]);
    setInputError(null);
  };

  const raw = () => {
    if (q.kind === "input") {
      const n = normaliseRatioAnswer(text);
      if (!n.ok) {
        setInputError(n.error);
        return null;
      }
      return n.value;
    }
    if (q.kind === "build") return slots;
    if (q.kind === "total") return parseInt(q.answerOptions[selected], 10);
    if (q.kind === "meaning") return selected;
    return parseOption(q.answerOptions[selected]);
  };

  const canSubmit = q.kind === "input" ? text.trim() !== "" : q.kind === "build" ? slots.every((s) => s !== null) : selected !== null;

  const check = () => {
    if (lock.current || !canSubmit || status !== "answering") return;
    const value = raw();
    if (value === null) return;
    lock.current = true;
    const { r, fb } = evaluate(q, value);
    const correct = r.category === "correct";
    playSound(correct ? "correct" : "incorrect");
    if (!isSimpler && firstResult.current === null) firstResult.current = r.category;
    const nextHistory = [...history, r.category];
    setHistory(nextHistory);
    if (!correct) update((s) => recordMisconception(s, r.category));
    if (mode === "assessment") {
      onComplete({ correct, category: r.category, attempts: 0 });
      return;
    }
    if (correct && practice && !isSimpler) update((s) => recordAnswer(s, q.id, { correct: true, attempts: nextHistory.length - 1 }));
    if (!correct && practice && looksUnstable(nextHistory)) update((s) => recordMisconception(s, "G"));
    const slotErrors = q.kind === "build" && !correct && r.category !== "A" && r.category !== "C" ? [value[0] !== slotValue(q.groups, q.first), value[1] !== slotValue(q.groups, q.second)] : null;
    setResult({ r, fb, slotErrors, value });
    setStatus(correct ? "correct" : "wrong");
  };

  const retry = () => {
    lock.current = false;
    setStatus("answering");
    setResult((x) => (x ? { ...x, fb: null } : x));
    if (q.kind === "choice" || q.kind === "mistake" || q.kind === "total" || q.kind === "meaning") setSelected(null);
  };

  const goSimpler = () => {
    setQ(simplerQuestion(question));
    setIsSimpler(true);
    setHistory([]);
    setResult(null);
    resetInputs();
    lock.current = false;
    setStatus("answering");
  };

  const proceed = () => {
    playSound("next");
    if (isSimpler) {
      setQ(question);
      setIsSimpler(false);
      setHistory([]);
      setResult(null);
      resetInputs();
      lock.current = false;
      setStatus("answering");
      return;
    }
    onComplete({ correct: firstResult.current === "correct", category: firstResult.current, attempts: history.length - 1 });
  };

  const wrongCount = history.filter((c) => c !== "correct").length;
  const showWorked = (q.difficulty === "challenging" && status !== "answering")
    || (status === "wrong" && (mode === "mastery" || wrongCount >= 2) && q.kind !== "meaning");
  const highlight =
    status === "wrong" && result?.fb?.highlight
      ? result.fb.highlight
      : status === "correct"
      ? { order: [q.first, q.second], whole: involvesWhole(q) }
      : {};
  const showBoard = q.showVisual || status !== "answering";
  const offerSimpler = practice && status === "wrong" && !isSimpler && looksUnstable(history);
  const max = Math.max(10, Math.min(24, slotValue(q.groups, "whole") + 2));
  const optionTexts = q.kind === "meaning" ? q.answerOptions.map((o) => o.text) : q.answerOptions;

  return (
    <section className="rq-question-enter space-y-5" data-testid={testid} aria-labelledby={`${testid}-prompt`}>
      {isSimpler && (
        <RafiSays testid="simpler-intro">Good effort. Let's try a simpler example together, then go back to the first question.</RafiSays>
      )}
      <div className="grid lg:grid-cols-2 gap-5 items-start">
        <div className="space-y-4">
          {q.examStyle && (
            <p className="inline-flex rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-sm font-semibold text-indigo-900" data-testid="original-exam-style-label">
              Original exam-style reasoning question
            </p>
          )}
          <h2 id={`${testid}-prompt`} className="font-heading text-xl sm:text-2xl font-semibold text-slate-900 leading-snug" data-testid="question-prompt">
            {q.prompt}
          </h2>
          {q.kind === "mistake" && (
            <p className="inline-flex items-center gap-2 rounded-xl bg-amber-50 border-2 border-amber-300 px-3 py-2 font-semibold text-slate-900" data-testid="rafi-answer">
              Rafi's answer: <span className="ratio-mono text-xl">{q.rafiAnswer}</span>
            </p>
          )}
          {showHint && practice && status === "answering" && (
            <p className="rounded-xl bg-orange-50 border border-orange-200 px-3 py-2 text-slate-800" data-testid="hint-text">
              <strong>Hint:</strong> {q.hint || "Count each group carefully, then check which comes first in the question."}
            </p>
          )}
        </div>
        {showBoard && (
          <div>
            <ObjectBoard groups={q.groups} wholeWord={q.wholeWord} highlight={highlight} revealWhole={status === "correct" || showWorked} testid="question-board" />
            {q.compareGroups && status === "wrong" && (
              <div className="mt-3">
                <p className="text-sm font-semibold text-slate-700 mb-1">Before adding:</p>
                <ObjectBoard groups={q.compareGroups} wholeWord={q.wholeWord} testid="compare-board" />
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        {(q.kind === "choice" || q.kind === "mistake" || q.kind === "total" || q.kind === "meaning") && (
          <ChoiceAnswer options={optionTexts} selected={selected} onSelect={setSelected} disabled={status !== "answering"} mono={q.kind !== "meaning"} />
        )}
        {q.kind === "input" && (
          <RatioInput value={text} onChange={(v) => { setText(v); setInputError(null); }} error={inputError} disabled={status !== "answering"} onEnter={check} />
        )}
        {q.kind === "build" && (
          <BuildAnswer slots={slots} setSlots={setSlots} max={max} cards={q.buildCards} slotErrors={status === "wrong" && result?.slotErrors ? result.slotErrors : [false, false]} disabled={status !== "answering"} />
        )}
      </div>

      <FeedbackPanel ref={fbRef} status={status} fb={status === "answering" ? null : result?.fb} worked={showWorked ? workedSteps(q) : null} />

      <div className="flex flex-wrap items-center gap-3">
        {status === "answering" && (
          <button type="button" className="rq-btn-primary" disabled={!canSubmit} onClick={check} data-testid="check-answer-btn">
            {mode === "assessment" ? "Save answer" : "Check answer"}
          </button>
        )}
        {status === "wrong" && practice && (
          <button type="button" className="rq-btn-primary" onClick={retry} data-testid="try-again-btn">
            Try again
          </button>
        )}
        {(status === "correct" || (status === "wrong" && mode === "mastery")) && (
          <button type="button" className="rq-btn-primary" onClick={proceed} data-testid="continue-btn">
            {isSimpler ? "Back to the first question" : "Continue"}
          </button>
        )}
        {offerSimpler && (
          <button type="button" className="rq-btn-secondary" onClick={goSimpler} data-testid="simpler-btn">
            Try a simpler example
          </button>
        )}
        {practice && status === "answering" && !showHint && (
            <button type="button" className="rq-btn-secondary" onClick={() => { setShowHint(true); update(recordHint); playSound("hint"); }} data-testid="hint-btn">
            <HelpCircle size={18} aria-hidden="true" /> Show me a hint
          </button>
        )}
      </div>
    </section>
  );
}
