// Parent gate — a button that only works when pressed and held for 3 seconds.
// A ring fills up while holding (CSS transition); letting go early resets it.
// The 3-second timer itself is a plain setTimeout, so it works even when the
// browser skips animation frames.
import { h } from './dom.js';
import { ICONS } from './icons.js';
import { t } from './i18n.js';

const HOLD_MS = 3000;

export function parentGateButton(onPass) {
  // pathLength="100" lets the CSS use simple 0–100 values for the ring.
  const ring = `<svg class="gate-ring" viewBox="0 0 64 64" aria-hidden="true">
    <circle cx="32" cy="32" r="28" fill="none" stroke-width="6" pathLength="100"/></svg>`;
  const button = h('button', {
    class: 'icon-btn gate-btn',
    type: 'button',
    'aria-label': t('parentHold'),
    html: ring + ICONS.gear,
  });
  button.style.setProperty('--hold-ms', `${HOLD_MS}ms`);

  let timer = 0;

  function start(event) {
    // Capture keeps us receiving pointerup even if the finger slides a little.
    button.setPointerCapture?.(event.pointerId);
    button.classList.add('holding');
    timer = setTimeout(() => {
      reset();
      onPass();
    }, HOLD_MS);
  }

  function reset() {
    clearTimeout(timer);
    button.classList.remove('holding');
  }

  button.addEventListener('pointerdown', start);
  button.addEventListener('pointerup', reset);
  button.addEventListener('pointercancel', reset);
  // A long press on Android would otherwise open the context menu.
  button.addEventListener('contextmenu', (e) => e.preventDefault());
  return button;
}
