import { useState } from "react";
import { Link } from "react-router-dom";
import { Trophy } from "lucide-react";
import { QuestionRunner } from "../rq/QuestionRunner";
import { RafiSays } from "../rq/Rafi";

function RoundSequence({ rounds, Round, onDone, testid }) {
  const [i, setI] = useState(0);
  const [results, setResults] = useState([]);
  const handle = (r) => {
    const next = [...results, r];
    setResults(next);
    if (i + 1 < rounds.length) setI(i + 1);
    else onDone(next);
  };
  return (
    <div className="space-y-4" data-testid={testid}>
      <p className="text-sm font-bold text-slate-600 uppercase tracking-wide" data-testid="question-counter">Round {i + 1} of {rounds.length}</p>
      <Round key={i} {...rounds[i]} onComplete={handle} />
    </div>
  );
}

export function GameRunner({ title, intro, makeQuestions, onFinish, hintFirst = false, Round, testid = "game" }) {
  const [phase, setPhase] = useState("intro");
  const [qs, setQs] = useState(null);
  const [score, setScore] = useState(null);
  const start = () => {
    setQs({ id: Date.now(), list: makeQuestions() });
    setPhase("play");
  };
  const done = (results) => {
    const s = results.filter((r) => r.correct).length;
    setScore({ s, total: results.length });
    onFinish(s, results.length);
    setPhase("reward");
  };
  return (
    <div className="space-y-5" data-testid={testid}>
      <h1 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900" data-testid={`${testid}-title`}>{title}</h1>
      <div className="rq-card p-4 sm:p-6">
        {phase === "intro" && (
          <div className="space-y-5">
            <RafiSays>{intro}</RafiSays>
            <button type="button" className="rq-btn-primary" onClick={start} data-testid="game-start-btn">
              Let's play
            </button>
          </div>
        )}
        {phase === "play" &&
          (Round ? (
            <RoundSequence key={qs.id} rounds={qs.list} Round={Round} onDone={done} testid={`${testid}-runner`} />
          ) : (
            <QuestionRunner key={qs.id} questions={qs.list} onDone={done} hintFirst={hintFirst} label="Round" testid={`${testid}-runner`} />
          ))}
        {phase === "reward" && (
          <div className="space-y-5" data-testid="game-reward">
            <div className="flex items-center gap-4">
              <Trophy size={56} className="text-amber-500" aria-hidden="true" />
              <div>
                <p className="font-heading text-2xl font-bold text-slate-900">Challenge complete!</p>
                <p className="text-slate-700 text-lg" data-testid="game-score">{score.s} of {score.total} correct on the first try. You solved every one in the end!</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" className="rq-btn-primary" onClick={start} data-testid="play-again-btn">
                Play again
              </button>
              <Link to="/games" className="rq-btn-secondary" data-testid="back-games-btn">
                Back to games
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
