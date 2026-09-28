// Audio — sound effects synthesised with the Web Audio API, and speech with speechSynthesis.
// No sound files: every effect is a few oscillator "notes".

let ctx = null;

// Browsers only allow audio after a user gesture, so the context is created lazily.
function audioContext() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// One note: frequency glides from `freq` to `to` over `dur` seconds, with a soft fade-out.
function note({ freq, to = freq, dur = 0.15, type = 'sine', volume = 0.2, delay = 0 }) {
  const ac = audioContext();
  if (!ac) return;
  const start = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  osc.frequency.exponentialRampToValueAtTime(to, start + dur);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

export const sfx = {
  pop: () => note({ freq: 500, to: 900, dur: 0.09 }),
  chime: () => {
    note({ freq: 660, dur: 0.25, type: 'triangle' });
    note({ freq: 990, dur: 0.35, type: 'triangle', delay: 0.12 });
  },
  boing: () => note({ freq: 320, to: 110, dur: 0.3, type: 'triangle', volume: 0.25 }),
  // A drop falling into liquid.
  plop: () => note({ freq: 900, to: 180, dur: 0.12, volume: 0.25 }),
  // Bubbling while stirring: a few quick random blips.
  bubbles: () => {
    for (let i = 0; i < 6; i++) {
      const f = 250 + Math.random() * 400;
      note({ freq: f, to: f * 1.6, dur: 0.07, volume: 0.12, delay: i * 0.15 });
    }
  },
  // A star flying to the counter: two quick high notes.
  twinkle: () => {
    note({ freq: 1320, dur: 0.12, type: 'triangle', volume: 0.15 });
    note({ freq: 1760, dur: 0.18, type: 'triangle', volume: 0.15, delay: 0.08 });
  },
  // Big success: a little rising arpeggio.
  fanfare: () => {
    [523, 659, 784, 1047].forEach((freq, i) => note({ freq, dur: 0.3, type: 'triangle', delay: i * 0.12 }));
  },
};

// Unlock audio on the very first touch so the first sound isn't lost.
export function initAudio() {
  window.addEventListener('pointerdown', audioContext, { once: true });
}

// ---- Speech ----

const LOCALES = { fr: 'fr-FR', es: 'es-ES', en: 'en-GB' };

// Voices load asynchronously on Android/Chrome; getVoices() may be empty at first.
function findVoice(lang) {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  // Android sometimes reports "fr_FR" instead of "fr-FR".
  const matching = voices.filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith(lang));
  if (!matching.length) return null;
  // Prefer voices installed on the device: they also work offline.
  const exact = (v) => v.lang.replace('_', '-') === LOCALES[lang];
  return matching.find((v) => v.localService && exact(v))
    ?? matching.find((v) => v.localService)
    ?? matching.find(exact)
    ?? matching[0];
}

export function canSpeak(lang) {
  return 'speechSynthesis' in window && findVoice(lang) !== null;
}

// Say `text` in `lang`. If no voice exists for that language we stay silent rather
// than reading French with an English voice. Returns true if speech was started.
export function speak(text, lang) {
  if (!('speechSynthesis' in window)) return false;
  const voice = findVoice(lang);
  if (!voice) return false;
  speechSynthesis.cancel(); // never queue up: the latest instruction wins
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = voice.lang;
  utterance.rate = 0.9; // a little slower for young listeners
  speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}
