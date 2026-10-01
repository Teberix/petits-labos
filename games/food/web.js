// "Qui mange qui ?" — pure logic (no DOM), tested in tests/food.test.mjs.
//
// Every level lists ALL the rounds it can make (levelRounds); makeRound picks one at
// random, so rounds vary from one replay to the next. The tests go through that whole
// list and check each round has exactly one right answer (the game's "solver").
import { ANIMALS, PLANTS, CHAINS } from './levels.js';

export const isPlant = (id) => PLANTS.includes(id);
export const isAnimal = (id) => id in ANIMALS;

// Does `eater` clearly, typically eat `food`? (its `eats` list)
export function eats(eater, food) {
  return ANIMALS[eater]?.eats.includes(food) ?? false;
}

// Might `eater` eat `food`, even only now and then? (`eats` or `sometimes`)
// Wrong cards and decoys must be clearly outside this.
export function mightEat(eater, food) {
  return eats(eater, food) || (ANIMALS[eater]?.sometimes ?? []).includes(food);
}

// What may be shown as a food card being eaten: plants and small animals (snacks).
// Bigger animals are never shown eaten.
export function foodCards() {
  return [...PLANTS, ...Object.keys(ANIMALS).filter((id) => ANIMALS[id].snack)];
}

// Every way to pick `k` items of `list` (order kept).
export function combinations(list, k) {
  if (k === 0) return [[]];
  const out = [];
  list.forEach((first, i) => {
    for (const rest of combinations(list.slice(i + 1), k - 1)) out.push([first, ...rest]);
  });
  return out;
}

// Every order of `list`.
export function permutations(list) {
  if (list.length <= 1) return [list];
  return list.flatMap((first, i) =>
    permutations([...list.slice(0, i), ...list.slice(i + 1)]).map((rest) => [first, ...rest]));
}

// ---------- feed: one animal, 3 cards, one is its food ----------

// All { animal, answer, wrong: [2 cards] } a feed level can show. The answer is a card
// the animal clearly eats; the wrong cards are clearly outside its diet (not even
// `sometimes`) — of the other kind (plant vs animal) for distractors 'other', of the
// same kind for 'same'.
function feedRounds(level) {
  const cards = foodCards();
  const out = [];
  for (const animal of level.animals) {
    for (const answer of cards.filter((c) => eats(animal, c))) {
      const pool = cards.filter((c) => !mightEat(animal, c)
        && (isPlant(c) === isPlant(answer)) === (level.distractors === 'same'));
      for (const wrong of combinations(pool, 2)) out.push({ animal, answer, wrong, key: animal });
    }
  }
  return out;
}

// The hint after the n-th wrong card of a feed round (n = 1, 2, …):
//   'clue'   say what kind of food it eats (« … mange des plantes ») — only when the
//            wrong cards are of the other kind, so the clue really points to one card
//   'ask'    (same-kind cards, where that clue can't help) « regarde bien les trois »
//            + the question again: a gentle first step that points to no card
//   'pulse'  the right card glows
//   'wiggle' the right card dances until used
//   null     no new hint: a neutral « essaie encore »
export function feedHint(level, misses) {
  const steps = [level.distractors === 'other' ? 'clue' : 'ask', 'pulse', 'wiggle'];
  return steps[misses - 1] ?? null;
}

// ---------- home: some scenes, drag each animal home ----------

// The one scene of `scenes` where `animal` lives, or null (none, or several).
export function homeOf(animal, scenes) {
  const fits = scenes.filter((s) => ANIMALS[animal].habitats.includes(s));
  return fits.length === 1 ? fits[0] : null;
}

// All { scenes, animals: [{ id, home }] } a home level can show: `scenes` of the
// level's habitats, `perScene` animals for each, only animals that fit exactly ONE of
// the scenes shown (a seal is never asked with both the sea and the ice floe).
function homeRounds(level) {
  const out = [];
  for (const scenes of combinations(level.habitats, level.scenes)) {
    // Choices per scene: every group of `perScene` animals that live only there.
    const groups = scenes.map((scene) => combinations(
      Object.keys(ANIMALS).filter((id) => homeOf(id, scenes) === scene), level.perScene));
    if (groups.some((g) => g.length === 0)) continue; // not enough animals for a scene
    // One group per scene, every mix.
    let mixes = [[]];
    for (const g of groups) mixes = mixes.flatMap((mix) => g.map((group) => [...mix, group]));
    for (const mix of mixes) {
      const animals = mix.flatMap((group, i) => group.map((id) => ({ id, home: scenes[i] })));
      out.push({ scenes, animals, key: scenes.join('+') });
    }
  }
  return out;
}

// The hint after the n-th wrong scene for ONE animal of a home round (n = 1, 2, …):
//   'ask'   « pas là ! Où vit le lapin ? » — points to no scene
//   'name'  say where it lives (« le lapin vit dans la forêt »): the child still has
//           to find that scene
//   'glow'  the right scene glows until the animal is there
//   null    no new hint: a neutral line (the scene keeps glowing)
export function homeHint(misses) {
  return ['ask', 'name', 'glow'][misses - 1] ?? null;
}

// ---------- chain: put a food chain in order ----------

// Is `list` a real food chain (each one eaten by the next)?
export function chainOk(list) {
  return list.every((id, i) => i === 0 || eats(id, list[i - 1]));
}

// Animals that can be a decoy for `entry`: from a scene the chain doesn't happen in,
// and nothing in the chain might eat it or be eaten by it (a marmot is no decoy next
// to a fox: foxes catch marmots in the mountains).
function decoysFor(entry) {
  return Object.keys(ANIMALS).filter((id) =>
    !entry.chain.includes(id)
    && !ANIMALS[id].habitats.includes(entry.habitat)
    && !entry.chain.some((other) => mightEat(id, other) || mightEat(other, id)));
}

// All { chain, given, cards, decoys } a chain level can show: the first `given` links
// are already in place, `cards` (the rest + the decoys) wait in the tray.
function chainRounds(level) {
  const out = [];
  for (const entry of CHAINS.filter((c) => c.chain.length === level.length)) {
    for (const decoys of combinations(decoysFor(entry), level.decoys)) {
      out.push({
        chain: entry.chain, given: level.given, decoys,
        cards: [...entry.chain.slice(level.given), ...decoys], key: entry.chain.join('>'),
      });
    }
  }
  return out;
}

// A full chain built by the child (`slots`: one id per slot) checked against the
// round's chain: true for each slot that holds the right one. (The right order is
// the only real food chain the cards can make — chainSolutions, tested — so a slot
// is judged by position, never by "does it eat the one before", which can be true
// for a wrong order: the seal also eats krill.)
export function chainCheck(round, slots) {
  return slots.map((id, i) => id === round.chain[i]);
}

// The hint after the n-th wrong full chain of a round (n = 1, 2, …):
//   'ask'   « qui mange l'herbe ? » about the first wrong slot — points to no card
//   'glow'  the card for the first empty slot glows
//   'dance' it dances
//   null    no new hint: a neutral line (it keeps dancing)
export function chainHint(misses) {
  return ['ask', 'glow', 'dance'][misses - 1] ?? null;
}

// Every full chain a child could build from a chain round that is a real food chain.
// The round is fair when there is exactly one (tested for every round).
export function chainSolutions(round) {
  const fixed = round.chain.slice(0, round.given);
  const free = round.chain.length - round.given;
  const orders = combinations(round.cards, free).flatMap(permutations);
  return orders.map((order) => [...fixed, ...order]).filter(chainOk);
}

// ---------- rounds ----------

// A level's rounds are listed once, then kept (a home level has thousands).
const roundsCache = new WeakMap();

export function levelRounds(level) {
  if (!roundsCache.has(level)) {
    const build = { feed: feedRounds, home: homeRounds, chain: chainRounds }[level.type];
    roundsCache.set(level, build(level));
  }
  return roundsCache.get(level);
}

// Shuffles a copy of `list` (Fisher–Yates).
export function shuffled(list, random) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// One round, picked at random among ALL the level's rounds. `previousKey` = the last
// round's key: never the same animal (feed), scenes (home) or chain twice in a row.
// Cards, animals and scenes come shuffled; feed rounds also get `cards` (answer +
// wrong).
export function makeRound(level, random, previousKey = null) {
  const all = levelRounds(level);
  const fresh = all.filter((r) => r.key !== previousKey);
  const pool = fresh.length ? fresh : all;
  const round = pool[Math.floor(random() * pool.length)];
  if (level.type === 'feed') return { ...round, cards: shuffled([round.answer, ...round.wrong], random) };
  if (level.type === 'home') {
    return { ...round, scenes: shuffled(round.scenes, random), animals: shuffled(round.animals, random) };
  }
  return { ...round, cards: shuffled(round.cards, random) };
}
