import { useRef, useState } from "react";
import { QuestionCard } from "./QuestionCard";

export function QuestionRunner({ questions, mode = "practice", onDone, label = "Question", hintFirst = false, testid = "question-runner" }) {
  const [i, setI] = useState(0);
  const results = useRef([]);
  const q = questions[i];
  const handle = (res) => {
    results.current = [...results.current.slice(0, i), { ...res, qid: q.id, type: q.comparisonType, tag: q.tag, setId: q.setId, kind: q.kind }];
    if (i + 1 < questions.length) setI(i + 1);
    else onDone(results.current);
  };
  return (
    <div className="space-y-4" data-testid={testid}>
      <p className="text-sm font-bold text-slate-600 uppercase tracking-wide" data-testid="question-counter">
        {label} {i + 1} of {questions.length}
      </p>
      <QuestionCard key={`${q.id}-${i}`} question={q} mode={mode} onComplete={handle} hintOpen={hintFirst && i === 0} />
    </div>
  );
}
