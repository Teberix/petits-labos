// Small UI building blocks shared by every screen.
import { h } from './dom.js';
import { ICONS } from './icons.js';
import { getLang, t } from './i18n.js';
import { canSpeak, sfx, speak } from './audio.js';

export function iconButton(icon, label, onclick, extraClass = '') {
  return h('button', {
    class: `icon-btn ${extraClass}`,
    type: 'button',
    'aria-label': label,
    title: label,
    html: ICONS[icon] ?? icon,
    onclick: (e) => { sfx.pop(); onclick(e); },
  });
}

// Top bar: [left buttons] [title] [right buttons]
export function topBar({ left = [], title = '', right = [] }) {
  return h('header', { class: 'top-bar' },
    h('div', { class: 'bar-side' }, left),
    h('h1', { class: 'bar-title' }, title),
    h('div', { class: 'bar-side bar-right' }, right),
  );
}

// ---- Spoken instructions + the "repeat" button ----

let lastInstruction = null;

// Read an instruction aloud and remember it for the repeat button.
export function say(text, lang = getLang()) {
  lastInstruction = { text, lang };
  speak(text, lang);
  updateRepeatButtons();
}

export function repeatButton() {
  const button = h('button', {
    class: 'icon-btn repeat-btn',
    type: 'button',
    'aria-label': t('repeat'),
    title: t('repeat'),
    html: ICONS.speaker,
    onclick: () => lastInstruction && speak(lastInstruction.text, lastInstruction.lang),
  });
  queueMicrotask(updateRepeatButtons);
  return button;
}

// With no voice for the language, the repeat button is hidden instead of doing nothing.
function updateRepeatButtons() {
  const available = canSpeak(lastInstruction?.lang ?? getLang());
  document.querySelectorAll('.repeat-btn').forEach((b) => { b.hidden = !available; });
}

// Voices arrive late on Android: re-check once they're loaded.
window.speechSynthesis?.addEventListener?.('voiceschanged', updateRepeatButtons);
