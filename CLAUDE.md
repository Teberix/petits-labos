# CLAUDE.md — Petits Labos

Educational STEM/logic game hub (PWA) for two 6-year-old early readers, played on an
Android tablet/phone. Learning through play, never through pressure. The owner is learning
Claude Code with this project: **keep code simple, readable, and commented where the logic
isn't obvious.**

## Hard rules

**Tech**
- Plain HTML/CSS/JS (ES modules OK), no framework, no build step, no npm dependencies at runtime.
- No external network calls, no ads, no purchases, no analytics, no data collection.
  All data lives in `localStorage` on the device.
- No external assets: art = inline SVG/CSS, sounds = Web Audio API, voice = `speechSynthesis`.
- **Public repo: no personal data.** Daughters' names/avatars exist only on the device —
  never in code, fixtures, screenshots, or commit messages.

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
- Test at minimum: 360px phone, large phone, 10" tablet — both orientations.

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

## Game 1 — "La Potion" (colour mixing)

A creature asks for a potion (target colour + icon). Child drags ingredients into the
cauldron, stirs, sees the result. Match → happy creature + reward.

Levels (unlock gradually, per profile):
1. Primary colours — pick the one correct ingredient.
2. Two primaries → secondary colour (cause and effect).
3. Quantities change the shade (2 yellow + 1 red = orange-yellow). Counting 1–5.
4. Lighten/darken with white/black ("what happens if…?").
5. Free lab: no target, unlimited mixing, result named aloud.

Rules:
- Mixing is **subtractive / paint-like** (red+blue=purple, yellow+blue=green), not RGB
  additive. Simple, predictable model, documented in code.
- "Empty cauldron" button always available.
- After 2 wrong attempts: visual hint (correct ingredients flash).
- Level data lives in a config file — levels are editable without touching game logic.

## How to work

- Build in small steps; after each: self-verify (open locally, console errors, touch,
  offline), then report briefly what was done and how to test it.
- Ask only on real blockers/ambiguity. Don't add unrequested features — propose them.

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
js/dragdrop.js         draggable(el, { targets, onDrop, onTap, canDrag }) — pointer events, ghost copy
js/rewards.js          stars + stickers (shared by all games): addStar, flyStar, showSticker, starBadge
js/stickers.js         the 24 album stickers (SVG) — names in js/i18n as sticker.<id>
js/ui.js, dom.js, icons.js   top bar, repeat button, h() DOM helper, shell SVG icons
js/screens/            profiles, hub, game (mounts a game + builds ctx), parent, collection (album)
games/registry.js      one line per game
games/<id>/meta.js     id, titleKey, strings, tile icon (loaded eagerly by the hub)
games/<id>/<id>.js     default export { mount(container, ctx), unmount() } (lazy-loaded)
tools/                 dev-only Node scripts, zero dependencies (never loaded by the app)
tests/                 dev-only unit tests: node --test tests/*.test.mjs
```

La Potion (`games/potion/`) — 10 levels: 1 primaries · 2 secondaries · 3 review · 4 counting
1–5 · 5 shades (2+1 drops) · 6 light/dark (white, black) · 7 3-ingredient recipes · 8 free lab
(done after the first named mix) · 9 colour detective (shade, no recipe) · 10 4–5 drop recipes.
Wrong amounts of the right colours → "Almost! Add a little more X!" (`missingIngredient()`).
Progress is saved by level `id` — never renumber existing levels.
`levels.js` = level config (edit freely, documented at top),
`mixing.js` = RYB paint model + `matches()` (modes `ratio` with tolerance, `counts` exact —
level 3 must use `counts`), `strings.js` = all lines it speaks, `art.js` = SVG,
`potion.css` = its own stylesheet (loaded by the game, relative to the module).
Don't use `requestAnimationFrame` for game logic/timers (it pauses in some webviews) —
use `setTimeout` + CSS animations.

Conventions:
- **All URLs relative** (`./sw.js`, `css/base.css`) — the app lives at `/petits-labos/`.
- **New/removed app file → `node tools/update-precache.mjs`** (release does it too).
  `serve.mjs` warns at startup if the list is stale.
- Game contract and `ctx` fields are documented at the top of `js/screens/game.js`.
- Game-specific strings go in the game's `meta.js` (`strings`), not in `js/i18n/`.
- Updates are applied only at safe moments: app launch, entering hub/profiles, or the app
  returning to the foreground on hub/profiles. Never while a game is mounted.
- Storage format change → bump `SCHEMA_VERSION` + add a migration in `js/storage.js`.
- Rewards: 1 star per success (games call `ctx.rewards.star(el)`), a random new sticker
  every 5 stars (`ctx.rewards.showSticker` — await it before moving on). No scores,
  no ratings, never take stars away. Free-play modes give no stars.

## Local dev

```bash
node tools/serve.mjs          # → http://localhost:8080/petits-labos/ (same sub-path as Pages)
```
- The service worker caches everything, so edits don't show on reload. During development
  use **`http://localhost:8080/petits-labos/?nosw`**: it unregisters the SW and clears
  caches (localhost only). Drop `?nosw` to test offline/update behaviour.
- Icons: `node tools/make-icons.mjs` regenerates `icons/` (SVG + 192/512/maskable PNGs)
  from the shape list in that script — pure Node, no packages.
- Offline test: load once without `?nosw`, stop the server, reload.

## Release routine

Repo: https://github.com/Teberix/petits-labos — live app: https://teberix.github.io/petits-labos/
(setup done 2026-09-28; commits use the repo-local GitHub noreply email, never the personal one).

One-time setup (already done, kept for reference):
```bash
gh repo create petits-labos --public --source . --push
gh api -X POST repos/{owner}/petits-labos/pages -f "source[branch]=main" -f "source[path]=/"
```
The app is then at `https://<github-user>.github.io/petits-labos/`.

Each release:
```bash
node tools/release.mjs            # patch: 0.1.0 → 0.1.1
node tools/release.mjs minor      # new level/game: 0.1.1 → 0.2.0
```
It bumps `VERSION` in `sw.js` + `js/version.js`, refreshes PRECACHE, commits everything
("Release vX.Y.Z"), tags, and pushes `main`. Pages redeploys in ~1 min; devices download
the new version in the background and switch at their next safe moment.
Before releasing: check `git status` for anything that shouldn't be public.
