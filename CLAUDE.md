# CLAUDE.md — Petits Labos

Educational STEM/logic game hub (PWA) for two 6-year-old early readers, played on an
Android tablet/phone. Learning through play, never through pressure. The owner is learning
Claude Code with this project: **keep code simple, readable, and commented where the logic
isn't obvious.**

Each game has its own notes in `games/<id>/CLAUDE.md` (read them when working on it).
Roadmap and status: `GAMES.md` (one game at a time; DONE only after the owner confirms a
playtest).

## Hard rules

**Tech**
- Plain HTML/CSS/JS (ES modules OK), no framework, no build step. **No dependencies in
  the app**; dev tools may use Playwright (devDependency only, never loaded by the app).
- No external network calls, no ads, no purchases, no analytics, no data collection.
  All data lives in `localStorage` on the device.
- No external assets: art = inline SVG/CSS, sounds = Web Audio API, voice = `speechSynthesis`.
- **Public repo: no personal data.** Daughters' names/avatars exist only on the device —
  never in code, fixtures, screenshots, or commit messages (enforced by the gate's privacy
  check, from the git-ignored `tools/private-words.txt`).

**Offline-first & updates (non-negotiable)**
- After first load the app is 100% playable offline, indefinitely. Service worker is
  cache-first for every app file. No feature may depend on the network.
- Versioned cache from a single `VERSION` constant, bumped on every release.
- When online, the SW fetches the new version in the background and installs it silently;
  it is applied **only on the next app launch, never mid-game**. Old caches are deleted
  after activation.
- Kids never see update prompts. Version number + "check for updates" button live behind
  the parent gate.
- Progress in `localStorage` must survive updates. Storage has a schema version; format
  changes get a migration — **never wipe progress.**

**UX (kids)**
- Touch-first: touch targets ≥ 64px, drag-and-drop via pointer/touch events, nothing
  hover-dependent. Icon/colour/audio-driven, minimal text.
- No timers, no lives, no "game over". Mistakes → funny/neutral reaction + gentle hint.
- Parent gate (press-and-hold 3 s) in front of settings and profile management.
- Voice reads instructions aloud in the active language, with a "repeat" button. Degrade
  gracefully when no voice exists for that language.

**Responsive**
- Phone + tablet, portrait + landscape. Relative units, CSS grid/flexbox. Rearrange layout
  rather than shrinking touch targets below 64px. Respect safe areas
  (`env(safe-area-inset-*)`). No orientation lock unless a game truly requires it.
- Checked by the gate at 7 sizes: 360×640, 640×360, 412×915, 915×412, 800×1280, 1280×800
  (touch) and 1366×657 (laptop, mouse).

**i18n**
- All UI strings in dictionaries (`fr`, `es`, `en`). Default: French.
- Games that teach letters/words/reading support all 3 languages (selectable per profile).
  Non-linguistic games use French by default.

## Architecture

- Hub: pick a profile → pick a mini-game. Two profiles (name + avatar, emoji or simple
  SVG), progress saved per profile.
- Each mini-game is a self-contained module in its own folder, registered in the hub via
  one registry entry. Adding a game must not touch other games.
- Shared utilities: i18n, audio (sfx + speech), storage (+ migrations), drag-and-drop
  helper, rewards (stars/stickers shown in a per-profile "collection" screen), parent gate.

## How to work

- Build in small steps. New game: `/new-game <n>` (design → OK → steps).
- **Verification = `/gate`** (`tools/gate.mjs` + the `kid-ux-reviewer` / `pwa-guardian`
  subagents). Don't re-verify manually what the gate covers; report only failures and
  what the gate can't check (e.g. real touch feel, voice quality).
- Ask only on real blockers/ambiguity. Don't add unrequested features — propose them.
- Windows: commit with a message file (`git commit -F <file>`); never pipe the message
  through PowerShell (a here-string piped to `git commit -F -` is taken as a pathspec).

## Code map

```
index.html, manifest.webmanifest   app shell + PWA manifest (all paths RELATIVE)
sw.js                  service worker: VERSION, PRECACHE (generated), cache-first, deferred update
js/app.js              boot, screen switching, "safe moments" for applying updates
js/updates.js          SW registration, applyIfWaiting(), manual check
js/storage.js          localStorage document, schema version + MIGRATIONS
js/i18n.js, js/i18n/   t(), addStrings(); fr/es/en dictionaries
js/audio.js            Web Audio sfx + speechSynthesis (prefers local voices)
js/parentgate.js       3 s press-and-hold button
js/dragdrop.js         draggable(el, { targets, onDrop(target, point), onTap, canDrag }) — pointer events, ghost copy
js/rewards.js          stars + stickers (shared by all games): addStar, flyStar, showSticker, starBadge
js/stickers.js         the 24 album stickers (SVG) — names in js/i18n as sticker.<id>
js/ui.js, dom.js, icons.js   top bar, repeat button, h() DOM helper, shell SVG icons
js/screens/            profiles, hub, game (mounts a game + builds ctx), parent, collection (album)
games/registry.js      one line per game
games/<id>/meta.js     id, titleKey, strings, tile icon (loaded eagerly by the hub)
games/<id>/<id>.js     default export { mount(container, ctx), unmount() } (lazy-loaded)
games/<id>/checks.js   dev-only: worst-case screens + offline interaction for the gate
games/<id>/CLAUDE.md   dev-only: that game's notes
tools/                 dev-only Node scripts (never loaded by the app)
tests/                 dev-only unit tests: node --test tests/*.test.mjs
.claude/               settings.json (permissions), agents/ (reviewers), commands/ (/gate, /new-game)
```

Conventions:
- **All URLs relative** (`./sw.js`, `css/base.css`) — the app lives at `/petits-labos/`.
- **New/removed app file → `node tools/update-precache.mjs`** (release does it too).
  Dev-only files (`checks.js`, `*.md`) are never precached (`isDevOnly()` in
  `tools/precache.mjs`).
- Game contract and `ctx` fields are documented at the top of `js/screens/game.js`.
- Game-specific strings go in the game's `strings.js` / `meta.js`, not in `js/i18n/`.
- Updates are applied only at safe moments: app launch, entering hub/profiles, or the app
  returning to the foreground on hub/profiles. Never while a game is mounted.
- Storage format change → bump `SCHEMA_VERSION` + add a migration in `js/storage.js`.
- Don't use `requestAnimationFrame` for game logic/timers (it stops in some webviews and
  background tabs) — use `setTimeout` + CSS animations.
- Rewards: 1 star per success (games call `ctx.rewards.star(el)`), a random new sticker
  every 5 stars (`ctx.rewards.showSticker` — await it before moving on). No scores,
  never take stars away. Free-play modes give no stars.
  Exception (owner's decision, 2026-09-28): a game may give **+1 bonus star** for an
  especially efficient solution (Robot Codeur: fewest cards), and mark a level done that
  way with a crown. Always positive: a normal success still gets its star, nothing is
  ever shown as a failure, and "try to do better" is said at most once per level.

## Verification (the gate)

```bash
node tools/gate.mjs                 # everything: unit + privacy + layout + offline (~1.5 min)
node tools/gate.mjs --game robot    # layout/offline for one game (during a build step)
node tools/gate.mjs --only unit,privacy
```
- `check-layout.mjs`: every game × its `checks.js` worst cases × 7 sizes (touch contexts,
  laptop with mouse). No page scroll, touch targets ≥ 64px / on screen / not overlapping,
  grid cells ≥ the game's `minCell`. Failure screenshots → `tools/.check-output/`.
- `check-offline.mjs`: service worker active, every PRECACHE file cached and no dev-only
  file, nothing fails to load; then server stopped + network cut, each game's `offline()`
  interaction must succeed.
- `check-privacy.mjs`: words from `tools/private-words.txt` (git-ignored; `word @ file` =
  allowed in that file only) in committed/staged/untracked files and commit messages; the
  list itself must never be tracked; no network calls/URLs in app code.
- Never hangs: 10 s per Playwright action, 30 s per page load, 60 s per worst case /
  `offline()` (constants in `check-kit.mjs`). Failures show the page's JS errors; a worst
  case that times out or hits a JS error is skipped at the remaining sizes.
- Needs once: `npm install` + `npx playwright install chromium`.

## Local dev

```bash
node tools/serve.mjs          # → http://localhost:8080/petits-labos/ (same sub-path as Pages)
node tools/serve.mjs --lan    # also on the WiFi: prints http://<this-pc-ip>:8080/petits-labos/
```
- Default = this computer only. `--lan` listens on all interfaces for tablet playtests
  (Windows may ask to allow Node through the firewall). Over the LAN there is **no
  service worker** (browsers only allow it on localhost/HTTPS): play-testing works,
  offline/updates don't. Hidden files/folders (`.git`, `.claude`…) are never served.
- The service worker caches everything, so edits don't show on reload. During development
  use **`http://localhost:8080/petits-labos/?nosw`**: it unregisters the SW and clears
  caches (localhost only).
- Icons: `node tools/make-icons.mjs` regenerates `icons/` (SVG + 192/512/maskable PNGs)
  from the shape list in that script — pure Node, no packages.

## Release routine

Repo: https://github.com/Teberix/petits-labos — live app: https://teberix.github.io/petits-labos/
(setup done 2026-09-28; commits use the repo-local GitHub noreply email, never the personal one).

```bash
node tools/release.mjs            # patch: 0.1.0 → 0.1.1
node tools/release.mjs minor      # new level/game: 0.1.1 → 0.2.0
```
It runs the **full gate first and refuses if it fails** (nothing changed). Then it bumps
`VERSION` in `sw.js` + `js/version.js`, refreshes PRECACHE, commits tracked changes + new
files under the app/tool/test/config paths only (prints the list, and what it left out),
tags, and pushes `main`. Pages redeploys in ~1 min; devices download the new version in
the background and switch at their next safe moment.
