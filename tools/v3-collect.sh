#!/bin/sh
# Collect v3 export batches (EXPB 701+) from this session's transcript into design/export-v3 (merging), print status.
cd "$(dirname "$0")/.." && LZ=/tmp/claude-0/-home-claude/a2b275b4-dd54-5ce5-a3e9-e07213c3038c/scratchpad/lz/node_modules/lz-string MIN_BN=801 \
  node tools/collect-export.js /root/.claude/projects/-home-claude/a2b275b4-dd54-5ce5-a3e9-e07213c3038c.jsonl design/export-v3
