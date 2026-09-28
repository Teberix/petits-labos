// Tiny DOM helper so screens can build elements without innerHTML
// (profile names are user input, so they must always go in as text).
//
//   h('button', { class: 'big', onclick: go }, 'Hello', someElement)
//
// - attrs starting with "on" become event listeners
// - `html` sets innerHTML — only for our own trusted SVG strings
// - string children become text nodes; null/false children are skipped
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (key.startsWith('on')) el.addEventListener(key.slice(2), value);
    else if (key === 'html') el.innerHTML = value;
    else el.setAttribute(key, value === true ? '' : value);
  }
  for (const child of children.flat()) {
    if (child == null || child === false) continue;
    el.append(child instanceof Node ? child : String(child));
  }
  return el;
}
