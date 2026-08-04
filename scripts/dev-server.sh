#!/usr/bin/env bash
# Start/stop the dev server as a background process bound to your local
# network, so the dashboard is reachable from other devices (phone, etc.)
# while Claude Code logs to it from this machine. Uses `astro dev` (not
# build+preview) so newly logged entries show up on refresh without a
# rebuild.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

PID_FILE=".server.pid"
LOG_FILE=".server.log"
PORT="${PORT:-4321}"

lan_ip() {
  ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "<your-lan-ip>"
}

is_running() {
  [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null
}

start() {
  if is_running; then
    echo "Already running (PID $(cat "$PID_FILE"))."
    status
    exit 0
  fi
  echo "Starting on port $PORT, bound to your local network..."
  nohup npx astro dev --host --port "$PORT" > "$LOG_FILE" 2>&1 &
  echo $! > "$PID_FILE"
  sleep 1
  if is_running; then
    echo "Started (PID $(cat "$PID_FILE")). Logs: $LOG_FILE"
    echo "  Local:   http://localhost:$PORT"
    echo "  Network: http://$(lan_ip):$PORT"
  else
    echo "Failed to start — check $LOG_FILE"
    rm -f "$PID_FILE"
    exit 1
  fi
}

stop() {
  if [ ! -f "$PID_FILE" ]; then
    echo "Not running (no PID file)."
    exit 0
  fi
  PID="$(cat "$PID_FILE")"
  if kill -0 "$PID" 2>/dev/null; then
    kill "$PID"
    echo "Stopped (PID $PID)."
  else
    echo "PID $PID wasn't running; clearing stale PID file."
  fi
  rm -f "$PID_FILE"
}

status() {
  if is_running; then
    echo "Running (PID $(cat "$PID_FILE"))."
    echo "  Local:   http://localhost:$PORT"
    echo "  Network: http://$(lan_ip):$PORT"
  else
    echo "Not running."
  fi
}

case "${1:-}" in
  start) start ;;
  stop) stop ;;
  status) status ;;
  restart) is_running && stop; start ;;
  *) echo "Usage: $0 {start|stop|status|restart}"; exit 1 ;;
esac
