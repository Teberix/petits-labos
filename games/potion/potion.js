// "La Potion" — placeholder for step (a) so the hub → game → hub flow can be tested.
// The real game (levels 1–2) replaces this in step (b).
import { h } from '../../js/dom.js';

let root = null;

export default {
  mount(container, ctx) {
    root = h('div', { class: 'placeholder' }, h('p', {}, ctx.t('comingSoon')));
    container.append(root);
    ctx.speak(ctx.t('comingSoon'));
  },
  unmount() {
    root?.remove();
    root = null;
  },
};
