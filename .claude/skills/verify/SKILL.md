---
name: verify
description: Before a commit, run the gate level of the current step (game step → --game <id>; otherwise → --only unit,privacy). Never the full gate.
---

Run this before every commit of a build step.

1. Find the step type from `git status --short`:
   - Only `games/<id>/…` paths (and that game's tests or data) changed → **game step**.
   - Anything else → **other step**.
2. Run the gate level of that step:
   - Game step: `node tools/gate.mjs --game <id> --quick`
     and `node tools/gate.mjs --only privacy`.
   - Other step: `node tools/gate.mjs --only unit,privacy`.
3. **Never run the full gate** (`node tools/gate.mjs` without options). It takes ~18 min.
   It stays a planned step of its own: shared code or a release, run alone,
   reviewers after it.
4. Report:
   - PASS → one line. Then commit.
   - FAIL → the failing lines only. Do not commit.
