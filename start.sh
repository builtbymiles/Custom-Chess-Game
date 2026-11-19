#!/bin/sh
# Ascend · Grandmaster Academy — starts a local server and opens the game.
cd "$(dirname "$0")"
PORT=${1:-8080}
(sleep 1 && open "http://localhost:$PORT") &
exec python3 -m http.server "$PORT"
