// Inline SVG icons used by the shell (original art, no external files).
// They use currentColor so CSS decides their colour.

export const ICONS = {
  speaker: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  gear: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10.3 2h3.4l.5 2.6 1.8.8 2.2-1.5 2.4 2.4-1.5 2.2.8 1.8 2.6.5v3.4l-2.6.5-.8 1.8 1.5 2.2-2.4 2.4-2.2-1.5-1.8.8-.5 2.6h-3.4l-.5-2.6-1.8-.8-2.2 1.5-2.4-2.4 1.5-2.2-.8-1.8L2 13.7v-3.4l2.6-.5.8-1.8-1.5-2.2 2.4-2.4 2.2 1.5 1.8-.8zM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"/></svg>`,
  home: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3 2 12h3v8h5v-5h4v5h5v-8h3z"/></svg>`,
  back: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4 7 12l8 8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  // Same 5-point star as the "star" sticker.
  star: `<svg viewBox="0 0 100 100" aria-hidden="true"><polygon points="50,8 61,36 91,38 68,58 76,90 50,74 24,90 32,58 9,38 39,36" fill="#FFC83D" stroke="#F29E00" stroke-width="5" stroke-linejoin="round"/></svg>`,
  // Sticker album: an open book with a round sticker on each page.
  album: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 5.5C5 4 8.5 4 12 6c3.5-2 7-2 10-.5V20c-3-1.5-6.5-1.5-10 .5-3.5-2-7-2-10-.5z" fill="currentColor"/><path d="M12 6v14.5" stroke="#fff" stroke-width="1.5"/><circle cx="7" cy="11" r="2.6" fill="#FFC83D"/><circle cx="17" cy="11" r="2.6" fill="#FF8FAB"/></svg>`,
  // The child's meadow (rewards option B): a little tree on a green hill under the sun.
  meadow: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="6" r="3" fill="#FFC83D"/><path d="M1 21c4-6 8-7 11-6s7 2 11 6z" fill="#7CB342"/><rect x="7.2" y="11" width="1.6" height="5" fill="#8B5E3C"/><circle cx="8" cy="9.5" r="3.5" fill="#3FA34D"/></svg>`,
  // The next reward (end of the album's progress bar).
  gift: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="9" width="18" height="12" rx="2" fill="#EF476F"/><rect x="2" y="6" width="20" height="4" rx="1.5" fill="#F25C82"/><rect x="11" y="6" width="2" height="15" fill="#FFD23F"/><path d="M12 6C9 2 5.5 4 8 6zM12 6c3-4 6.5-2 4 0z" fill="#FFD23F"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`,
};
