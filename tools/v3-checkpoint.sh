#!/bin/sh
# collect export slices and commit them (skip CI) so an interrupted session can resume
cd "$(dirname "$0")/.." && ./tools/v3-collect.sh && git add -A design/export-v3 tools docs && git commit -qm "v3 export checkpoint: $(ls design/export-v3/raw | wc -l) slices [skip ci]

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01LUeXQhXEA5gum8oSPNUU4w" && git push -q origin main && echo pushed
