---
description: Run the verification gate (tests, privacy, layout, offline) and the reviewers that apply, then summarise
argument-hint: "[game-id]"
---

Verify the current working tree of Petits Labos. Don't verify manually what this covers.

1. **What changed** — run `git status --short` and `git diff --name-only HEAD` (plus the
   untracked files from status). From that list:
   - changed games = the `<id>` of every `games/<id>/…` path;
   - "shell changed" = any change to `index.html`, `manifest.webmanifest`, `sw.js`,
     `css/`, `js/` (includes `js/storage.js`) or `tools/`.
   If "$ARGUMENTS" names a game id, treat that game as changed too.

2. **Gate** — exactly one of:
   - exactly one changed game and the shell did not change → `node tools/gate.mjs --game <id>`
   - otherwise → `node tools/gate.mjs` (full gate)

3. **Reviewers** — in parallel (one message, several Agent calls), read-only:
   - `kid-ux-reviewer` once per changed game (give it the game id and its changed files);
   - `pwa-guardian` only if the shell changed (give it the changed files).
   No changed game and no shell change → no reviewers.

4. **Summary** — short:
   - gate: PASSED/FAILED, with only the failing lines;
   - each reviewer: PASS, or its violations as reported (file:line — fix);
   - what the gate can't check and a human should (e.g. real touch feel, voice quality).
   Don't repeat passing details. Don't fix anything in this command — just report.
