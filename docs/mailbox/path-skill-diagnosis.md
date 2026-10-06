# Path skill diagnosis (preview.8)

Read list: js/path.js, js/progress.js, games/balance/balance.js 55–135, games/balance/checks.js (offline), games/train/train.js 122–126, 378.

## Result
Bug found. A round with no mistake is recorded as outcome `again` (−1 step). The skill never leaves step 1.

## Cause
`games/balance/balance.js:68-69`:
```js
const HINTS = [null, 'clue', 'glow', 'dance'];
const strongestHint = (misses) => HINTS[misses] ?? 'again';
```
With `misses = 0`, `HINTS[0]` is `null`. `null ?? 'again'` returns `'again'` (`??` treats `null` as missing).
`js/progress.js:22` maps `again` to −1. `js/progress.js:37` clamps at 1. So skill stays 1, and `rounds` still grows.

Same code in Train: `games/train/train.js:125-126`, called at `games/train/train.js:378`.
Not run in Chromium (see "Not done"). The code is identical, so the same bug applies.

The Node check (1→3→5→7) passed because it called `outcomeOf(null)` directly. The runtime never passes `null`.

## Printed states (Chromium, local server, fresh profile through `addProfile`, `fixedMap` false)
`ctx.path.record` wrapped through a route on `js/path.js` (the app files are unchanged).

| Case | record(level.id, hint, levels.length) | skills.balance after each round | Second ▶ shows |
|---|---|---|---|
| 3 clean rounds | 1, `again`, 8 (×3) | rounds 1,2,3; skill 1; seen [1] | level 1: 2 objects, "heavy", no cubes |
| 6 clean rounds (2 ▶) | 1, `again`, 8 (×6) | skill 1; rounds 6 | level 1 again |
| 1 wrong answer per round | 1, `clue`, 8 (×3) | skill 1 (clue = 0: by design) | level 1 |
| tap/drag before weighing, no miss | 1, `again`, 8 (×3) | skill 1 | level 1 |

No `pageerror`. No console error. No console warning except "Service Worker registration blocked" (test setting).
`record` is called once per round. Storage writes come from `setSkill` (`storage.js:377`). Nothing overwrites the skill.

## Not done (budget limit)
- Live preview.8 run: the script failed at start (`localStorage` was null after `addProfile` there). Not fixed. The owner's phone shows the same symptom, and the cause above explains it. Chromium reproduces it locally, so it is not phone-specific.
- Train in Chromium: my script timed out on the drop (script problem, not an app finding).

## Proposed fix (one line, both games)
Replace `HINTS[misses] ?? 'again'` with `misses < HINTS.length ? HINTS[misses] : 'again'` in `games/balance/balance.js:69` and `games/train/train.js:126`.
Better: one shared helper in `js/progress.js` (`hintForMisses(misses)`), with a unit test: `hintForMisses(0) === null`, `1 → 'clue'`, `4 → 'again'`.

## Proposed checks (Balance and Train offline blocks)
After the 3 clean rounds of one ▶ (no wrong answer, so the existing wrong answer in round 1 must move to a second ▶ or be removed from this check):
1. `JSON.parse(localStorage['petits-labos']).profiles[0].skills.<game>.skill === 7`.
2. Tap ▶ again. Balance: the tray shows 3 objects (level id 8). Train: the picked level is id 8 (`gap: two`, 9 wagons).
Note: the current offline blocks make 1 wrong answer in round 1, so skill goes 1→1→3→5 (clue = 0). Use a separate clean ▶ for the skill===7 check.
