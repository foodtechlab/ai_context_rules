#!/bin/zsh

set -euo pipefail

title="${1:-Codex}"
message="${2:-Работа завершена.}"

/usr/bin/osascript - "$title" "$message" <<'APPLESCRIPT'
on run argv
  set alertTitle to item 1 of argv
  set alertMessage to item 2 of argv
  display alert alertTitle message alertMessage
end run
APPLESCRIPT
