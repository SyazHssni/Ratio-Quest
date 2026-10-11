import { useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Lock, Play } from "lucide-react";
import { PageTitle } from "../components/rq/AppShell";
import { useProgress } from "../context/ProgressContext";
import { useAudio } from "../audio/AudioContext";
import { Year6EmojiModel } from "../components/rq/Year6EmojiModel";
import { YEAR6_LESSONS, YEAR6_QUESTIONS } from "../data/year6Course";
import { completeYear6LessonProgress, year6CheckpointDone, year6CheckpointOpen, YEAR6_CHECKPOINTS } from "../lib/year6Progress";

const lessonFor = (id) => YEAR6_LESSONS.find((l) => l.id === id);
const normalizeAnswer = (value, type) => type === "ratioInput"
  ? String(value).trim().toLowerCase().replace(/\s+/g, "").replace(/to/g, ":")
  : String(value).trim();

function Year6Lesson({ lesson, onBack }) {
  const { year6Progress, updateYear6, saveYear6Progress } = useProgress();
  const { playSound } = useAudio();
  const [params] = useSearchParams();
  const integrated = lesson.standard === "Integrated";
  const pool = useMemo(() => YEAR6_QUESTIONS.filter((q) => integrated ? q.secondaryLearningStandard === "7.3.1" : q.learningStandard === lesson.standard && !q.secondaryLearningStandard), [integrated, lesson.standard]);
  const [index, setIndex] = useState(0);
  const [lessonQuestions, setLessonQuestions] = useState(() => [...pool].sort(() => Math.random() - 0.5).slice(0, 3));
  const [picked, setPicked] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [retryUsed, setRetryUsed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [teachStep, setTeachStep] = useState(0);
  const [completionSaved, setCompletionSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const completionInFlight = useRef(false);
  const current = lessonQuestions[index % lessonQuestions.length];
  const answer = () => {
    if (picked === null || feedback) return;
    const correct = normalizeAnswer(picked, current.answerType) === normalizeAnswer(current.correctAnswer, current.answerType);
    setFeedback({ correct, text: correct ? current.explanation : `${current.feedback.wrong} ${current.explanation}` });
    if (correct) setScore((s) => s + 1);
    updateYear6((p) => {
      const byStandard = { ...p.byStandard };
      byStandard[current.learningStandard] = { attempted: byStandard[current.learningStandard].attempted + 1, correct: byStandard[current.learningStandard].correct + (correct ? 1 : 0) };
      return { ...p, attempted: p.attempted + 1, correct: p.correct + (correct ? 1 : 0), byStandard };
    });
    playSound(correct ? "correct" : "incorrect");
  };
  const advance = () => {
    if (index >= lessonQuestions.length - 1) { setFinished(true); setFeedback(null); playSound("levelComplete"); return; }
    setIndex((i) => i + 1); setPicked(null); setFeedback(null); setRetryUsed(false); playSound("next");
  };
  const retryQuestion = () => { setPicked(null); setFeedback(null); setRetryUsed(true); };
  const completeLesson = () => {
    if (score < 2 || completionSaved || completionInFlight.current) return;
    completionInFlight.current = true;
    const alreadyDone = Boolean(year6Progress.done?.[lesson.id]);
    const nextProgress = completeYear6LessonProgress(year6Progress, lesson.id, score);
    setSaveError(false);
    if (saveYear6Progress(nextProgress)) {
      setCompletionSaved(true);
      if (!alreadyDone) playSound("achievement");
    } else {
      completionInFlight.current = false;
      setSaveError(true);
    }
  };
  const retryLesson = () => {
    setFinished(false); setIndex(0); setPicked(null); setFeedback(null); setScore(0);
    setRetryUsed(false);
    setCompletionSaved(false); setSaveError(false);
    completionInFlight.current = false;
    setLessonQuestions([...pool].sort(() => Math.random() - 0.5).slice(0, 3));
  };
  const isProportionLesson = lesson.standard === "7.3.1";
  const isConnectLesson = lesson.id === "connect";
  const originalA = isProportionLesson ? (lesson.id === "both" ? 3 : 2) : (lesson.id === "meaning" || lesson.id === "simplest" ? 8 : 12);
  const originalB = isProportionLesson ? (lesson.id === "both" ? 5 : 3) : (lesson.id === "meaning" || lesson.id === "simplest" ? 12 : 18);
  const simplifyBy = lesson.id === "meaning" || lesson.id === "simplest" ? 4 : 6;
  const proportionFactor = lesson.id === "missing" || lesson.id === "both" || isConnectLesson ? 4 : 2;
  const fruitA = { key: "lesson-apples", plural: "apples", singular: "apple", emoji: "🍎", tone: "red" };
  const fruitB = { key: "lesson-oranges", plural: "oranges", singular: "orange", emoji: "🍊", tone: "orange" };
  const syrupA = { key: "lesson-syrup", plural: "cups of syrup", singular: "cup of syrup", emoji: "🥤", tone: "pink" };
  const waterB = { key: "lesson-water", plural: "cups of water", singular: "cup of water", emoji: "💧", tone: "blue" };
  const ruleText = lesson.id === "meaning"
    ? "A ratio compares quantities in a stated order. The first number counts the first named quantity; reversing the order changes what the numbers mean."
    : lesson.id === "preserve"
      ? "To keep a ratio equivalent, multiply or divide both terms by the same factor. Changing the terms by different amounts changes the relationship."
      : lesson.id === "connect"
        ? "First simplify by dividing both terms by the same factor. Then scale both terms by the same multiplier to find a matching ratio."
        : isProportionLesson
          ? "To keep a ratio equivalent, multiply or divide both quantities by the same factor."
          : "To simplify a ratio, divide both terms by the same common factor. The comparison stays equal.";
  const workedText = lesson.id === "meaning"
    ? "In 8 apples : 12 oranges, the first number counts apples and the second counts oranges. Reversing it gives 12 oranges : 8 apples."
    : lesson.id === "preserve"
      ? "For 12 : 18, divide both terms by 6 to get 2 : 3. Subtracting 6 instead gives 6 : 12, or 1 : 2, so the relationship changes."
      : lesson.id === "connect"
        ? "Simplify 12 : 18 by ÷6 to get 2 : 3. If 2 becomes 8 (×4), multiply 3 by 4 too: 8 : 12."
        : isProportionLesson
          ? `Start with ${originalA} : ${originalB}. Multiply both terms by ${proportionFactor}: ${originalA} × ${proportionFactor} = ${originalA * proportionFactor} and ${originalB} × ${proportionFactor} = ${originalB * proportionFactor}. The equivalent ratio is ${originalA * proportionFactor} : ${originalB * proportionFactor}.`
          : `Start with ${originalA} : ${originalB}. Divide both terms by ${simplifyBy}: ${originalA} ÷ ${simplifyBy} = ${originalA / simplifyBy} and ${originalB} ÷ ${simplifyBy} = ${originalB / simplifyBy}. So the simpler ratio is ${originalA / simplifyBy} : ${originalB / simplifyBy}.`;
  const workedNotation = lesson.id === "meaning" ? "8 apples : 12 oranges → 12 oranges : 8 apples" : lesson.id === "preserve" ? "12 : 18 → 2 : 3 (valid) · 12 : 18 → 6 : 12 (not equivalent)" : lesson.id === "connect" ? "12 : 18 → 2 : 3 → 8 : 12" : isProportionLesson ? `${originalA} : ${originalB} → ${originalA * proportionFactor} : ${originalB * proportionFactor}` : `${originalA} : ${originalB} → ${originalA / simplifyBy} : ${originalB / simplifyBy}`;
  const teachingStages = [
    { title: "1 · Meet the idea", text: `${lesson.teach} Ratios help us compare familiar quantities, such as fruit in a lunchbox or ingredients in a drink.` },
    { title: "2 · See the quantities", text: "Each emoji stands for one item. Read the two groups in order, then compare their sizes." },
    { title: "3 · Remember the rule", text: ruleText },
    { title: "4 · Work it through", text: workedText },
    { title: "5 · Check the relationship", text: lesson.id === "meaning" ? "The order tells us which number counts apples and which counts oranges." : lesson.id === "preserve" ? "Only changes made by the same factor preserve an equivalent ratio." : lesson.id === "connect" ? "Both steps used the same factor on each term, so 8 : 12 still simplifies to 2 : 3." : isProportionLesson ? "Both terms changed by the same factor, so the comparison is still equivalent." : `Both terms were divided by ${simplifyBy}, so the comparison is unchanged and in simplest form.` },
  ];

  return <div className="space-y-5" data-testid={`year6-lesson-${lesson.id}`}>
    <button className="rq-btn-secondary !min-h-[44px]" onClick={onBack}><ArrowLeft size={18} /> Back to my journey</button>
    <p className="text-sm font-bold uppercase tracking-wide text-slate-600">Year 6 · Learning Standard {lesson.standard}</p>
    <PageTitle title={lesson.title} subtitle={lesson.goal} testid="year6-lesson-title" />
    {teachStep < teachingStages.length && <section className="rq-card p-5 sm:p-7 space-y-4" aria-live="polite" data-testid="year6-teaching-stage">
      <p className="text-sm font-bold text-teal-800">Learn first · Step {teachStep + 1} of {teachingStages.length}</p>
      <h2 className="font-heading text-xl font-bold">{teachingStages[teachStep].title}</h2><p className="text-slate-800 text-lg leading-relaxed">{teachingStages[teachStep].text}</p>
      {teachStep === 1 && <div className="flex flex-wrap gap-3" aria-label="Ratio representation">{lesson.model.map((line, i) => <span key={i} className="rounded-xl bg-teal-50 border-2 border-teal-200 px-4 py-3 font-bold font-mono">{line}</span>)}</div>}
      {teachStep === 3 && <p className="rounded-xl bg-amber-50 border-2 border-amber-200 p-4 font-bold">{workedNotation}</p>}
      <button className="rq-btn-primary" onClick={() => setTeachStep((step) => step + 1)}>{teachStep < teachingStages.length - 1 ? "Show me the next step" : "Start guided practice"} <ArrowRight size={18} /></button>
    </section>}
    {teachStep >= 1 && <div className="grid lg:grid-cols-2 gap-4">
      <Year6EmojiModel title="Count the original quantities" first={{ ...(isProportionLesson ? syrupA : fruitA), count: originalA }} second={{ ...(isProportionLesson ? waterB : fruitB), count: originalB }} operation={isProportionLesson ? "one recipe batch" : `divide both by ${simplifyBy} to make equal groups`} />
      {isProportionLesson ? <Year6EmojiModel title="Scale both quantities together" first={{ ...syrupA, key: "lesson-scaled-syrup", count: originalA * proportionFactor }} second={{ ...waterB, key: "lesson-scaled-water", count: originalB * proportionFactor }} operation={`multiply each quantity by ${proportionFactor}; the ratio stays equivalent`} /> : <Year6EmojiModel title="Same relationship in simplest form" first={{ ...fruitA, key: "lesson-simple-apples", count: originalA / simplifyBy }} second={{ ...fruitB, key: "lesson-simple-oranges", count: originalB / simplifyBy }} operation={`each of ${simplifyBy} equal groups has ${originalA / simplifyBy} apples for every ${originalB / simplifyBy} oranges`} />}
      {isConnectLesson && <Year6EmojiModel title="Build a matching collection" first={{ ...fruitA, key: "lesson-new-apples", count: 8 }} second={{ ...fruitB, key: "lesson-new-oranges", count: 12 }} operation="the 2:3 group is repeated 4 times" />}
    </div>}
    {completionSaved ? <section className="rq-card p-6 space-y-4 border-2 border-green-300 bg-green-50" aria-live="polite" data-testid="year6-completion-success"><h2 className="font-heading text-2xl font-bold text-green-900">🎉 Lesson completed!</h2><p className="text-green-900">Great work! Your result ({score}/3) has been saved. Return to your learning journey to see which activity is next.</p><button className="rq-btn-primary" onClick={onBack}>Back to my journey <ArrowRight size={18} /></button></section> : teachStep >= teachingStages.length && !finished ? <section className="rq-card p-5 space-y-4" aria-live="polite">
      <p className="text-sm font-bold text-slate-600">Guided practice · {index + 1} of {lessonQuestions.length}</p>
      <h2 className="font-heading text-xl font-semibold">{current.question}</h2>
      {current.answerType === "choice" ? <div className="grid sm:grid-cols-2 gap-3">{current.options.map((option) => <button key={option} disabled={Boolean(feedback)} onClick={() => setPicked(option)} aria-pressed={picked === option} className={`min-h-12 rounded-xl border-2 p-3 text-left font-semibold ${picked === option ? "border-teal-700 bg-teal-50" : "border-slate-200"}`}>{option}</button>)}</div> : <label className="block space-y-2 font-semibold">{current.answerType === "numeric" ? "Enter the missing whole number" : "Write the ratio in simplest form"}<input type="text" inputMode={current.answerType === "numeric" ? "numeric" : "text"} autoComplete="off" disabled={Boolean(feedback)} value={picked ?? ""} onChange={(e) => setPicked(e.target.value)} placeholder={current.answerType === "numeric" ? "Whole number" : "For example, 2 : 3"} className="block w-full rounded-xl border-2 border-slate-300 p-3" /></label>}
      {!feedback ? <><p className="text-slate-600"><strong>Hint:</strong> {current.hint}</p><button className="rq-btn-primary" disabled={picked === null} onClick={answer}>Check answer</button></> : <div className={`p-4 rounded-xl border ${feedback.correct ? "bg-green-50 border-green-300" : "bg-amber-50 border-amber-300"}`}><p className="font-bold">{feedback.correct ? "Correct!" : "Let's check the relationship."}</p><p>{feedback.text}</p>{!feedback.correct && !retryUsed && <button className="rq-btn-secondary mt-3 mr-2" onClick={retryQuestion}>Try this question again</button>}<button className="rq-btn-primary mt-3" onClick={advance}>{feedback.correct || retryUsed || index === lessonQuestions.length - 1 ? (index === lessonQuestions.length - 1 ? "See my result" : "Next question") : "Skip to next question"}</button></div>}
    </section> : teachStep >= teachingStages.length && <section className="rq-card p-5 space-y-3" aria-live="polite"><h2 className="font-heading text-xl font-bold">Practice result: {score}/3</h2><p>{score >= 2 ? "You have enough correct answers to complete this lesson." : "Try the lesson again. Look closely at the hint and worked representation."}</p>{score >= 2 ? <><button className="rq-btn-primary" onClick={completeLesson}>Complete lesson and save progress</button>{saveError && <p role="alert" className="text-red-800 font-semibold">Your progress could not be saved. Your answers are still here; please try saving again.</p>}</> : <button className="rq-btn-primary" onClick={retryLesson}>Try again</button>}</section>}
    <p className="text-xs text-slate-500">Progress is saved separately for Year 6. {params.get("year") === "6" ? "" : "Year 6 course selected."}</p>
  </div>;
}

export default function Year6Page() {
  const [params, setParams] = useSearchParams();
  const { year6Progress } = useProgress();
  const { playSound } = useAudio();
  const selectedLesson = params.get("lesson");
  const lesson = lessonFor(selectedLesson);
  const done = year6Progress.done || {};
  const checkpointDone = (cp) => year6CheckpointDone(cp, done);
  const checkpointOpen = (i) => year6CheckpointOpen(YEAR6_CHECKPOINTS, i, done);
  const setLesson = (id) => { setParams({ year: "6", lesson: id }); playSound("select"); };
  const clearLesson = () => setParams({ year: "6" });
  if (selectedLesson && !lesson) return <section className="rq-card p-6 space-y-3"><PageTitle title="Lesson not found" subtitle="Choose a lesson from your Year 6 learning journey." testid="year6-invalid-lesson" /><Link to="/learn?year=6" className="rq-btn-primary">Back to Year 6 Learn</Link></section>;
  if (lesson) return <Year6Lesson key={lesson.id} lesson={lesson} onBack={clearLesson} />;

  return <div className="space-y-8" data-testid="learn-page" data-course="year6">
    <PageTitle title="Learn · Year 6 Ratio and Proportion" subtitle="Three checkpoints. Build your understanding and pass each checkpoint to open the next." testid="learn-title" />
    <ol className="space-y-4">{YEAR6_CHECKPOINTS.map((cp, i) => {
      const open = checkpointOpen(i); const completed = checkpointDone(cp); const started = cp.lessons.some((id) => done[id]); const completedLessons = cp.lessons.filter((id) => done[id]).length;
      return <li key={cp.id} className="rq-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4" data-testid={`year6-checkpoint-${cp.id}`}>
        <div className="flex items-start gap-4"><span className="font-heading text-3xl font-bold text-teal-700 w-12 h-12 rounded-2xl bg-teal-50 border-2 border-teal-200 flex items-center justify-center shrink-0">{i + 1}</span><div><p className="text-sm font-bold text-slate-600">Checkpoint {i + 1} · {cp.standards}</p><h2 className="font-heading text-xl sm:text-2xl font-semibold text-slate-900">{cp.title}</h2><p className="text-slate-700">{cp.focus}</p><div className="mt-2 flex flex-wrap gap-2">{cp.lessons.map((id) => { const l = lessonFor(id); return <button key={id} disabled={!open} onClick={() => setLesson(id)} className="text-sm underline text-teal-800 disabled:text-slate-500 disabled:no-underline">{l.title}{done[id] ? " ✓" : ""}</button>; })}</div><p className={`mt-2 text-sm font-semibold ${completed ? "text-green-800" : open ? "text-teal-800" : "text-slate-600"}`}>{completed ? <><CheckCircle2 size={16} className="inline" /> Completed · {completedLessons}/{cp.lessons.length} lessons</> : !open ? <><Lock size={16} className="inline" /> Locked · complete all {YEAR6_CHECKPOINTS[i - 1].lessons.length} lessons in Checkpoint {i} to unlock</> : <><Play size={16} className="inline" /> {started ? `In progress · ${completedLessons}/${cp.lessons.length} lessons complete` : `Ready · ${cp.lessons.length} lessons to complete`}</>}</p></div></div>
        <button disabled={!open} onClick={() => setLesson(cp.lessons.find((id) => !done[id]) || cp.lessons[0])} className={completed ? "rq-btn-secondary" : "rq-btn-primary"}>{completed ? "Revisit" : started ? "Continue" : "Start"} <ArrowRight size={18} /></button>
      </li>;
    })}</ol>
    <section className="space-y-3" aria-labelledby="year6-next-activities"><h2 id="year6-next-activities" className="font-heading text-2xl font-bold">After the three checkpoints</h2><div className="grid sm:grid-cols-3 gap-4"><Link to="/practice?year=6" className="rq-card p-5 hover:border-teal-500"><h3 className="font-heading text-lg font-semibold">Mixed Practice</h3><p className="text-slate-700 text-sm">Practise both Year 6 learning standards.</p></Link>{YEAR6_CHECKPOINTS.every(checkpointDone) ? <Link to="/final?year=6" className="rq-card p-5 hover:border-teal-500"><h3 className="font-heading text-lg font-semibold">Year 6 Final Challenge</h3><p className="text-slate-700 text-sm">Use simplification and proportion together.</p></Link> : <div className="rq-card p-5 opacity-70" aria-disabled="true"><h3 className="font-heading text-lg font-semibold"><Lock size={16} className="inline" /> Year 6 Final Challenge</h3><p className="text-slate-700 text-sm">Opens after the three Year 6 checkpoints are complete.</p></div>}<Link to="/progress?year=6" className="rq-card p-5 hover:border-teal-500"><h3 className="font-heading text-lg font-semibold">Year 6 Progress</h3><p className="text-slate-700 text-sm">Review standard-specific evidence.</p></Link></div></section>
  </div>;
}

export { YEAR6_CHECKPOINTS as CHECKPOINTS };
