# Ratio Quest — PRD

## Original problem statement
Build "Ratio Quest", an interactive Year 5 maths website teaching standard 7.2.1: represent ratio a : b for parts to parts, parts to whole, whole to part. Built on research (Perumal & Syed Zamri 2022; Machaba & Madzingira 2025; Bulut 2023). Lessons, Visual Lab, 60-question validated bank, misconception engine, games, progress, final assessment, Teacher Corner.

## User choices
- Progress saved in browser localStorage only (no accounts)
- Printable practice sheet in Teacher Corner: yes
- British English

## Architecture
Frontend-only React app (CRA/CRACO, Tailwind, shadcn). Pure modules: lib/ratio, lib/misconceptions, lib/mastery, lib/progress; data/questionBank (validated), data/lessons. Backend unused.

## Implemented (Jun 2026)
- 3 lessons × 8 steps (goal, explore, explain+checks, worked example, guided, independent, mastery, complete), sequential unlocking, step restore
- Misconception engine categories A–H with targeted feedback, highlights, worked example on 2nd miss, simpler-example on unstable pattern
- Visual Lab: 4 counter groups, comparison selector, live ratio + sentence, Build-the-ratio challenges
- Practice (topics + difficulty), Adventure zones, Ratio Detective, Build the Basket, Choose the Comparison, Fix the Mistake (incl. additive reasoning)
- Final Challenge (15 Q, 12/15 + 4/5 per type + same-objects item), recommendations
- Progress page (points, 6 badges, best/latest, reset, calm mode), Teacher Corner (objectives, misconception guide, print sheet with answer key, device-only summary)
- 77 unit tests passing; production build succeeds; testing agent iteration_1 passed

## Backlog
- P1: drag-and-drop in Build the Basket (tap already works)
- P1: optional teacher class sync backend
- P2: TypeScript migration; audio read-aloud of questions
