# Ratio Quest

An interactive Year 5 maths website that teaches learning standard **7.2.1 — represent the ratio of two quantities in the form a : b** (parts to parts, parts to whole, whole to part).

## Stack
- React 19 (Create React App + CRACO), Tailwind CSS, shadcn/ui, lucide-react icons.
- Progress is stored **only in the browser** (`localStorage`, key `ratio-quest-progress-v1`). No accounts, no personal data. The FastAPI backend in `/backend` is not used by the learning experience.

## Structure
```
frontend/src/
  lib/ratio.js            pure ratio maths, answer normalisation
  lib/misconceptions.js   misconception classifier (A–H) + feedback builder
  lib/mastery.js          mastery sets, lesson + final assessment rules
  lib/progress.js         progress data model (pure reducers) + storage adapter
  data/objects.js         item + context registry
  data/questionBank.js    60 validated questions (20 per type), validation + simpler-question generator
  data/lessons.js         lesson content (goal, story, checks, worked/guided examples)
  components/rq/          AppShell, ObjectBoard, RatioDisplay, QuestionCard, FeedbackPanel, Answers, QuestionRunner
  components/lesson/      explorers, worked example, mastery check
  components/games/       GameRunner, ClassifyRound, BasketRound
  pages/                  Home, Learn, Lesson, Lab, Practice, Games, Final, Progress, Teacher, NotFound
```

## Develop
```
cd frontend
yarn install
yarn start
```

## Test
```
cd frontend
CI=true yarn test --watchAll=false src/lib
```
Unit tests cover the ratio helpers (incl. boundaries/invalid input), the misconception classifier, question-bank validation (every stated answer must match the object counts), mastery/final rules and progress persistence.

## Build / deploy
```
cd frontend
yarn build
```
Serve `frontend/build` as a static site. Configure the host to rewrite unknown paths to `index.html` so client-side routes (e.g. `/learn/p2w`) survive a refresh.

## Known limitations
- JavaScript (not TypeScript); data integrity is enforced by runtime validation + unit tests instead of types.
- Progress is per device/browser only; the Teacher Corner shows this device's data and does not provide class analytics.
- Build the Basket uses tap +/− controls; drag-and-drop is not implemented (tap is the accessible equivalent).
- Fonts load from Google Fonts; if unavailable the site falls back to system fonts.
