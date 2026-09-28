// Rewrites the PRECACHE list in sw.js from the files on disk.
// Run after adding/removing app files:   node tools/update-precache.mjs
// (tools/release.mjs runs it automatically.)
import { writePrecache } from './precache.mjs';

const files = writePrecache();
console.log(`sw.js: PRECACHE now lists ${files.length} files.`);
