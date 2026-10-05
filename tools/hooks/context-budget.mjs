// Dev-only Claude Code hook (PostToolUse): watches the context size of the session.
// Context size = the usage of the last assistant message in the transcript:
// input + cache read + cache creation tokens.
//   < WARN_AT          → exit 0, silent
//   >= WARN_AT         → one warning per session (marker file in the OS temp dir)
//   >= CONTEXT_BUDGET  → block: Claude is told to commit what is green, report, stop
// Any error of this script (no transcript, bad JSON…) → exit 0. It never blocks
// because of itself.
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BUDGET = Number(process.env.CONTEXT_BUDGET) || 150000;
const WARN_AT = Math.min(120000, Math.floor(BUDGET * 0.8));

// Returns the context size from the last main-chain assistant message, or null.
function contextTokens(transcriptPath) {
  const lines = readFileSync(transcriptPath, 'utf8').split('\n');
  for (let i = lines.length - 1; i >= 0; i--) {
    if (!lines[i].trim()) continue;
    let entry;
    try { entry = JSON.parse(lines[i]); } catch { continue; } // half-written last line
    if (entry.type !== 'assistant' || entry.isSidechain) continue;
    const u = entry.message && entry.message.usage;
    if (!u) continue;
    return (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) +
      (u.cache_creation_input_tokens || 0);
  }
  return null;
}

function main() {
  const input = JSON.parse(readFileSync(0, 'utf8'));
  if (!input.transcript_path || !existsSync(input.transcript_path)) return;
  const n = contextTokens(input.transcript_path);
  if (n === null || n < WARN_AT) return;

  if (n >= BUDGET) {
    // PostToolUse "block": the reason is fed back to Claude.
    process.stdout.write(JSON.stringify({
      decision: 'block',
      reason: `Context budget reached (${n} tokens). Commit what is green, write the report, stop.`,
    }));
    return;
  }

  // Warning zone: warn only once per session.
  const marker = join(tmpdir(), `context-budget-${input.session_id || 'unknown'}.warned`);
  if (existsSync(marker)) return;
  writeFileSync(marker, String(n));
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext: `Context at ${n}. Plan to finish this step.`,
    },
  }));
}

try { main(); } catch { /* never block because of our own error */ }
process.exit(0);
