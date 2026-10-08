// A tiny fake DOM + localStorage for unit tests that build elements with js/dom.js h().
// Just enough for h(), replaceChildren, querySelector by one class, and storage.js.
class FakeEl {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.attrs = {};
    this.children = [];
    this.listeners = {};
    this.innerHTML = '';
    this.textContent = '';
    this.classList = { add() {}, remove() {} };
    this.offsetWidth = 0;
  }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return this.attrs[k] ?? null; }
  addEventListener(type, fn) { this.listeners[type] = fn; }
  append(...c) { this.children.push(...c); }
  replaceChildren(...c) { this.children = c; }
  // first descendant with this class (selector '.name' only)
  querySelector(sel) { return findByClass(this, sel.slice(1)); }
}

export function findByClass(root, name) {
  for (const c of root.children ?? []) {
    if (!(c instanceof FakeEl)) continue;
    if ((c.attrs.class ?? '').split(' ').includes(name)) return c;
    const deeper = findByClass(c, name);
    if (deeper) return deeper;
  }
  return null;
}

// Installs the globals; `badge` = what document.querySelector returns (the top-bar badge).
export function installFakeDom({ badge = null } = {}) {
  const map = new Map();
  globalThis.Node = FakeEl;
  globalThis.window = {};
  globalThis.document = { createElement: (tag) => new FakeEl(tag), querySelector: () => badge, documentElement: {} };
  globalThis.localStorage = {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    get length() { return map.size; },
    key: (i) => [...map.keys()][i] ?? null,
  };
  globalThis.location = { pathname: '/petits-labos/' };
  return { el: (tag) => new FakeEl(tag) };
}
