import { Link, useParams } from "react-router-dom";
import { Lock, Flower, Apple, Gem, Search, ShoppingBasket, Shuffle, Wrench, CheckCircle2 } from "lucide-react";
import { PageTitle } from "../components/rq/AppShell";
import { GameRunner } from "../components/games/GameRunner";
import { ClassifyRound } from "../components/games/ClassifyRound";
import { BasketRound } from "../components/games/BasketRound";
import { useProgress } from "../context/ProgressContext";
import { isLessonUnlocked, allCoreMastered, recordZone, recordGame, setLastActivity } from "../lib/progress";
import { ZONES, zoneQuestions, TYPE_NAMES } from "../lib/mastery";
import { QUESTION_BANK, buildQuestion } from "../data/questionBank";
import { makeGroups } from "../data/objects";
import { pickRandom, shuffle } from "../lib/random";
import NotFoundPage from "./NotFoundPage";

const ZONE_ICONS = { p2p: Flower, p2w: Apple, w2p: Gem };

const additiveQuestion = () => ({
  ...buildQuestion({ id: "fix-additive", ctx: "counters", a: 3, b: 4, first: "a", second: "b" }),
  kind: "meaning",
  showVisual: true,
  compareGroups: makeGroups("counters", 2, 3),
  prompt: "Rafi had 2 red counters and 3 blue counters, so Red : Blue = 2 : 3. He added 1 red and 1 blue. He says the ratio of red counters to blue counters is still 2 : 3. Can you help Rafi fix the answer?",
  answerOptions: shuffle([
    { text: "Now it is 3 : 4, which is a different relationship", category: "correct" },
    { text: "It is still 2 : 3 because he added the same to both", category: "D" },
    { text: "Adding 1 to each always keeps a ratio the same", category: "D" },
  ]),
  correctText: "Now there are 3 red and 4 blue counters: 3 : 4. Adding the same number to both groups changed the relationship, so 2 : 3 and 3 : 4 are not the same ratio.",
});

const basketRounds = () => {
  const targets = pickRandom([[2, 3], [4, 1], [3, 5], [1, 4], [5, 2], [3, 3], [2, 6]], 3);
  return targets.map(([a, b], i) => {
    const flip = i % 2 === 1;
    return {
      target: [a, b],
      question: buildQuestion({ id: `basket-${a}-${b}-${flip}`, ctx: "apples", a, b, first: flip ? "b" : "a", second: flip ? "a" : "b", kind: "build", difficulty: "easy", prompt: `What is the ratio of ${flip ? "green apples to red apples" : "red apples to green apples"} in your basket?` }),
    };
  });
};

const asChoice = (q) => ({ ...q, kind: q.kind === "mistake" ? "mistake" : "choice", showVisual: true, answerOptions: q.answerOptions });

export const GAMES = {
  detective: {
    title: "Ratio Detective",
    icon: Search,
    desc: "Look at the picture and find the ratio that answers the question.",
    intro: "Detective time! Read each question carefully. Which ratio matches what is being compared?",
    unlock: allCoreMastered,
    lockText: "Opens after all three checkpoints.",
    make: () => pickRandom(QUESTION_BANK.filter((q) => q.kind === "choice"), 5).map(asChoice),
  },
  basket: {
    title: "Build the Basket",
    icon: ShoppingBasket,
    desc: "Fill a basket to match, then write its ratio.",
    intro: "Let's pack some baskets! Use + and − to put the right apples in, then write the ratio.",
    unlock: (p) => p.lessons.p2p.mastered,
    lockText: "Opens after Checkpoint 1.",
    Round: BasketRound,
    make: basketRounds,
  },
  classify: {
    title: "Choose the Comparison",
    icon: Shuffle,
    desc: "Is it parts to parts, part to whole, or whole to part? Then build it.",
    intro: "First decide what kind of comparison the question asks for. Then build the ratio.",
    unlock: allCoreMastered,
    lockText: "Opens after all three checkpoints.",
    Round: ClassifyRound,
    make: () => ["p2p", "p2w", "w2p", pickRandom(["p2p", "p2w", "w2p"], 1)[0]].map((t) => ({ question: pickRandom(QUESTION_BANK.filter((q) => q.comparisonType === t && q.kind !== "mistake"), 1)[0] })),
  },
  fix: {
    title: "Fix the Mistake",
    icon: Wrench,
    desc: "Rafi made some mistakes. Can you help him fix them?",
    intro: "Oh no, I muddled some ratios! Can you help me find the right answers?",
    unlock: allCoreMastered,
    lockText: "Opens after all three checkpoints.",
    make: () => shuffle([...pickRandom(QUESTION_BANK.filter((q) => q.kind === "mistake"), 4).map(asChoice), additiveQuestion()]),
  },
};

export function GamesHub() {
  const { progress } = useProgress();
  return (
    <div className="space-y-8" data-testid="games-page">
      <PageTitle title="Games" subtitle="Practise your ratio skills on an adventure. Points come from thinking, not speed." testid="games-title" />
      <section aria-labelledby="map-heading" className="space-y-3">
        <h2 id="map-heading" className="font-heading text-2xl font-bold text-slate-900">Ratio Adventure map</h2>
        <ol className="grid md:grid-cols-3 gap-4 relative">
          {ZONES.map((z, i) => {
            const open = isLessonUnlocked(progress, z.id);
            const Icon = ZONE_ICONS[z.id];
            const done = progress.zones[z.id]?.completed;
            return (
              <li key={z.id} className={`rq-card p-5 space-y-3 ${open ? "" : "opacity-70"}`} data-testid={`zone-card-${z.id}`}>
                <div className="flex items-center gap-3">
                  <span className="w-12 h-12 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center"><Icon className="text-slate-900" aria-hidden="true" /></span>
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-600">Zone {i + 1} · {TYPE_NAMES[z.id]}</p>
                    <p className="font-heading text-lg font-semibold text-slate-900">{z.name}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-700">{z.story}</p>
                {done && <p className="text-sm font-semibold text-green-800 flex items-center gap-1"><CheckCircle2 size={16} aria-hidden="true" /> Zone complete</p>}
                {open ? (
                  <Link to={`/games/zone/${z.id}`} className={done ? "rq-btn-secondary" : "rq-btn-primary"} data-testid={`play-zone-${z.id}`}>{done ? "Play again" : "Enter zone"}</Link>
                ) : (
                  <p className="text-sm font-semibold text-slate-600 flex items-center gap-1" data-testid={`zone-locked-${z.id}`}><Lock size={16} aria-hidden="true" /> Master Checkpoint {i} to unlock</p>
                )}
              </li>
            );
          })}
        </ol>
      </section>
      <section aria-labelledby="mini-heading" className="space-y-3">
        <h2 id="mini-heading" className="font-heading text-2xl font-bold text-slate-900">Mini games</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {Object.entries(GAMES).map(([id, g]) => {
            const open = g.unlock(progress);
            return (
              <div key={id} className={`rq-card p-5 flex items-start gap-4 ${open ? "" : "opacity-70"}`} data-testid={`game-card-${id}`}>
                <g.icon size={32} className="text-teal-700 shrink-0" aria-hidden="true" />
                <div className="space-y-2">
                  <p className="font-heading text-lg font-semibold text-slate-900">{g.title}</p>
                  <p className="text-sm text-slate-700">{g.desc}</p>
                  {open ? (
                    <Link to={`/games/${id}`} className="rq-btn-secondary !min-h-[44px]" data-testid={`play-game-${id}`}>Play</Link>
                  ) : (
                    <p className="text-sm font-semibold text-slate-600 flex items-center gap-1" data-testid={`game-locked-${id}`}><Lock size={16} aria-hidden="true" /> {g.lockText}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

const LockedGame = ({ text }) => (
  <div className="rq-card p-8 max-w-xl space-y-4" data-testid="game-locked">
    <Lock className="text-slate-500" size={36} aria-hidden="true" />
    <h1 className="font-heading text-2xl font-bold text-slate-900">This game is still locked</h1>
    <p className="text-slate-700">{text}</p>
    <Link to="/learn" className="rq-btn-primary">Go to my lessons</Link>
  </div>
);

export function ZonePage() {
  const { zoneId } = useParams();
  const { progress, update } = useProgress();
  const zone = ZONES.find((z) => z.id === zoneId);
  if (!zone) return <NotFoundPage />;
  if (!isLessonUnlocked(progress, zone.id)) return <LockedGame text="Master the checkpoint before this zone to unlock it." />;
  return (
    <GameRunner
      key={zone.id}
      title={zone.name}
      intro={`${zone.story} The first question has a hint to guide you.`}
      makeQuestions={() => zoneQuestions(zone.id)}
      hintFirst
      onFinish={(s, t) => update((st) => setLastActivity(recordZone(st, zone.id, s, t), `/games/zone/${zone.id}`, zone.name))}
      testid={`zone-${zone.id}`}
    />
  );
}

export function GamePage() {
  const { gameId } = useParams();
  const { progress, update } = useProgress();
  const g = GAMES[gameId];
  if (!g) return <NotFoundPage />;
  if (!g.unlock(progress)) return <LockedGame text={g.lockText} />;
  return (
    <GameRunner
      key={gameId}
      title={g.title}
      intro={g.intro}
      makeQuestions={g.make}
      Round={g.Round}
      onFinish={(s, t) => update((st) => setLastActivity(recordGame(st, gameId, s, t), `/games/${gameId}`, g.title))}
      testid={`game-${gameId}`}
    />
  );
}
