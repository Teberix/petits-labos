// "Le Train des Suites" sounds — each token has its own musical note, so a pattern can
// be HEARD as a little tune (red-blue-red-blue = do-mi-do-mi). Kept inside the game
// (owner's decision): its own tiny Web Audio code, js/audio.js is not changed.

// Notes of a pentatonic scale: any mix of them sounds nice together.
export const PITCH = {
  red: 523,    // C5 (do)
  blue: 659,   // E5 (mi)
  yellow: 784, // G5 (sol)
  green: 880,  // A5 (la)
  purple: 1047, // C6 (do, higher)
  // Fruits: the same five notes.
  apple: 523,
  banana: 659,
  pear: 784,
  grapes: 880,
  watermelon: 1047,
};

let ac = null;

// Browsers only allow audio after a user gesture, so the context is created lazily
// (the first sound always follows a tap).
function audio() {
  if (!ac) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ac = new AC();
  }
  if (ac.state === 'suspended') ac.resume();
  return ac;
}

// One soft xylophone-like note.
function tone(freq, { dur = 0.35, volume = 0.22, type = 'triangle', to = freq } = {}) {
  const ctx = audio();
  if (!ctx) return;
  const start = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  osc.frequency.exponentialRampToValueAtTime(to, start + dur);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

// The note of a token (unknown tokens stay silent).
export function playNote(token) {
  if (PITCH[token]) tone(PITCH[token]);
}

// The empty wagon's "?" in a tune: a short, soft, low knock.
export function knock() {
  tone(220, { dur: 0.12, volume: 0.15, type: 'sine', to: 180 });
}

// The locomotive's whistle: two notes together, sliding down a little.
export function whistle() {
  tone(740, { dur: 0.7, volume: 0.12, type: 'sine', to: 700 });
  tone(932, { dur: 0.7, volume: 0.1, type: 'sine', to: 880 });
}
